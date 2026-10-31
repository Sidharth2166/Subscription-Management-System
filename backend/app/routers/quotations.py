from typing import List
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Quotation, QuotationLine, Subscription, SubscriptionLine, SubscriptionStatusHistory, TaxRule, User
from app.schemas import QuotationCreate, QuotationResponse
from app.services.auth import get_current_user, require_staff

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])

@router.get("", response_model=List[QuotationResponse])
def get_quotations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Quotation)
    if current_user and current_user.role == "customer" and current_user.customer_id:
        query = query.filter(Quotation.customer_id == current_user.customer_id)
    return query.order_by(Quotation.created_at.desc()).all()

@router.post("", response_model=QuotationResponse)
def create_quotation(
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    subtotal = Decimal('0.00')
    line_models = []

    for l in payload.lines:
        line_sub = (l.unit_price * Decimal(l.quantity)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        subtotal += line_sub

    # Apply 18% standard GST tax
    tax_rule = db.query(TaxRule).filter(TaxRule.is_default == True).first()
    tax_rate = (tax_rule.rate / Decimal('100.00')) if tax_rule else Decimal('0.18')
    tax_amount = (subtotal * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total_amount = subtotal + tax_amount

    count = db.query(Quotation).count() + 1
    quote_num = f"QTN-{datetime.utcnow().year}-{count:04d}"

    quote = Quotation(
        quotation_number=quote_num,
        customer_id=payload.customer_id,
        plan_id=payload.plan_id,
        status="sent",
        validity_date=payload.validity_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=Decimal('0.00'),
        total_amount=total_amount,
        notes=payload.notes,
        created_at=datetime.utcnow()
    )
    db.add(quote)
    db.flush()

    for l in payload.lines:
        line_sub = (l.unit_price * Decimal(l.quantity)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        q_line = QuotationLine(
            quotation_id=quote.id,
            product_id=l.product_id,
            variant_id=l.variant_id,
            quantity=l.quantity,
            unit_price=l.unit_price,
            subtotal=line_sub
        )
        db.add(q_line)

    db.commit()
    db.refresh(quote)
    return quote

@router.post("/{quotation_id}/convert-to-subscription")
def convert_to_subscription(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    quote = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
    if quote.status == "converted":
        raise HTTPException(status_code=400, detail="Quotation is already converted")

    # Create new subscription from quote
    sub_count = db.query(Subscription).count() + 1
    sub_num = f"SUB-{datetime.utcnow().year}-{sub_count:05d}"
    now = datetime.utcnow()
    cycle_end = now + timedelta(days=30)

    sub = Subscription(
        subscription_number=sub_num,
        customer_id=quote.customer_id,
        plan_id=quote.plan_id,
        quotation_id=quote.id,
        status="active",
        start_date=now,
        current_period_start=now,
        current_period_end=cycle_end,
        health_score="healthy",
        health_reason="Converted from quotation, initial period active",
        created_at=now
    )
    db.add(sub)
    db.flush()

    for ql in quote.lines:
        s_line = SubscriptionLine(
            subscription_id=sub.id,
            product_id=ql.product_id,
            variant_id=ql.variant_id,
            quantity=ql.quantity,
            unit_price=ql.unit_price
        )
        db.add(s_line)

    # Status history
    history = SubscriptionStatusHistory(
        subscription_id=sub.id,
        from_status="quotation",
        to_status="active",
        reason=f"Converted from Quotation {quote.quotation_number}",
        changed_by=current_user.name if current_user else "staff",
        created_at=now
    )
    db.add(history)

    quote.status = "converted"
    db.commit()
    db.refresh(sub)

    return {
        "status": "converted",
        "subscription_id": sub.id,
        "subscription_number": sub.subscription_number
    }
