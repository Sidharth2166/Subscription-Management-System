import os
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Invoice, User
from app.schemas import InvoiceResponse
from app.services.auth import get_current_user, require_staff
from app.services.billing_engine import generate_invoice_for_subscription
from app.services.pdf_service import generate_invoice_pdf
from app.services.rescue_engine import simulate_payment_failure, simulate_retry_success

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("", response_model=List[InvoiceResponse])
def get_invoices(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)

    if current_user and current_user.role == "customer" and current_user.customer_id:
        query = query.filter(Invoice.customer_id == current_user.customer_id)
    elif customer_id:
        query = query.filter(Invoice.customer_id == customer_id)

    if status:
        query = query.filter(Invoice.status == status)

    invoices = query.order_by(Invoice.issue_date.desc()).all()
    results = []
    for inv in invoices:
        res = InvoiceResponse.model_validate(inv)
        res.customer_name = inv.customer.company_name if inv.customer else "Unknown"
        results.append(res)
    return results

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if current_user and current_user.role == "customer" and current_user.customer_id != inv.customer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    res = InvoiceResponse.model_validate(inv)
    res.customer_name = inv.customer.company_name if inv.customer else "Unknown"
    return res

@router.post("/generate", response_model=InvoiceResponse)
def generate_invoice(
    subscription_id: int = Query(...),
    billing_period: str = Query(...),
    discount_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    try:
        inv = generate_invoice_for_subscription(db, subscription_id, billing_period, discount_code)
        res = InvoiceResponse.model_validate(inv)
        res.customer_name = inv.customer.company_name
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if current_user and current_user.role == "customer" and current_user.customer_id != inv.customer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    pdf_path = generate_invoice_pdf(inv)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"{inv.invoice_number}.pdf"
    )

@router.post("/{invoice_id}/simulate-failure")
def route_simulate_failure(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    try:
        result = simulate_payment_failure(db, invoice_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{invoice_id}/simulate-retry-success")
def route_simulate_retry_success(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    try:
        result = simulate_retry_success(db, invoice_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
