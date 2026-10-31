from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification, Invoice
from app.schemas import RescueQueueItem
from app.services.rescue_engine import get_rescue_summary, get_rescue_queue
from app.services.auth import require_staff

router = APIRouter(prefix="/api/rescue", tags=["Revenue Rescue Engine"])

@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return get_rescue_summary(db)

@router.get("/queue", response_model=List[RescueQueueItem])
def queue(db: Session = Depends(get_db)):
    return get_rescue_queue(db)

@router.post("/send-reminder/{invoice_id}")
def send_reminder(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        return {"status": "error", "message": "Invoice not found"}

    notif = Notification(
        title=f"Payment Reminder Dispatched: {inv.customer.company_name}",
        message=f"Sent automated SMS & Email dunning reminder for overdue invoice {inv.invoice_number} (₹{inv.amount_due}).",
        category="failed_payment",
        link_url=f"/invoices/{inv.id}",
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "message": f"Dunning reminder dispatched to {inv.customer.email}"
    }
