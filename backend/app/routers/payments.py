from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Payment, Invoice, Notification, User
from app.schemas import PaymentCreate, PaymentResponse
from app.services.auth import get_current_user, require_staff

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.get("", response_model=List[PaymentResponse])
def get_payments(
    invoice_id: Optional[int] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Payment)

    if current_user and current_user.role == "customer" and current_user.customer_id:
        query = query.filter(Payment.customer_id == current_user.customer_id)
    elif customer_id:
        query = query.filter(Payment.customer_id == customer_id)

    if invoice_id:
        query = query.filter(Payment.invoice_id == invoice_id)

    return query.order_by(Payment.payment_date.desc()).all()

@router.post("", response_model=PaymentResponse)
def record_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Invoice).filter(Invoice.id == payload.invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if payload.amount <= Decimal('0.00'):
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

    if payload.amount > inv.amount_due:
        raise HTTPException(status_code=400, detail=f"Amount exceeds outstanding balance (₹{inv.amount_due})")

    count = db.query(Payment).count() + 1
    pay_num = f"PAY-{datetime.utcnow().year}-{count:05d}"

    payment = Payment(
        payment_number=pay_num,
        invoice_id=inv.id,
        customer_id=inv.customer_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        status="success",
        reference_id=payload.reference_id or f"TXN-{int(datetime.utcnow().timestamp())}",
        notes=payload.notes,
        payment_date=datetime.utcnow()
    )
    db.add(payment)

    # Update invoice derived balances
    inv.amount_paid += payload.amount
    inv.amount_due = max(Decimal('0.00'), inv.total_amount - inv.amount_paid)

    if inv.amount_due == Decimal('0.00'):
        inv.status = "paid"
        if inv.subscription and inv.subscription.health_score == "at_risk":
            inv.subscription.health_score = "healthy"
            inv.subscription.health_reason = "Invoice paid in full"

    # Notification
    notif = Notification(
        title="Payment Recorded",
        message=f"Received payment {pay_num} of ₹{payload.amount} for {inv.invoice_number} from {inv.customer.company_name}.",
        category="invoice",
        link_url=f"/invoices/{inv.id}",
        created_at=datetime.utcnow()
    )
    db.add(notif)

    db.commit()
    db.refresh(payment)
    return payment
