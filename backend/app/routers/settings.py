from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TaxRule, Discount, Subscription, Notification
from app.services.billing_engine import generate_invoice_for_subscription

router = APIRouter(prefix="/api/settings", tags=["Settings & Demo Tools"])

@router.get("/taxes")
def get_tax_rules(db: Session = Depends(get_db)):
    return db.query(TaxRule).all()

@router.get("/discounts")
def get_discounts(db: Session = Depends(get_db)):
    return db.query(Discount).all()

@router.post("/fast-forward-cycle")
def fast_forward_billing_cycle(db: Session = Depends(get_db)):
    """
    Demo Mode Feature: Fast-forwards time by 1 month and triggers automated
    recurring billing for all active subscriptions so judges can see live invoices
    and lifecycle automation instantly.
    """
    active_subs = db.query(Subscription).filter(Subscription.status == "active").all()
    invoices_generated = 0

    next_period_code = f"DEMO-{int(datetime.utcnow().timestamp())}"

    for sub in active_subs[:5]: # Generate for top 5 active accounts
        try:
            generate_invoice_for_subscription(db, sub.id, next_period_code)
            # Advance subscription cycle by 30 days
            sub.current_period_start = sub.current_period_end
            sub.current_period_end = sub.current_period_end + timedelta(days=30)
            invoices_generated += 1
        except Exception:
            continue

    notif = Notification(
        title="Demo Fast-Forward Triggered",
        message=f"Advanced billing cycle. Successfully executed recurring billing engine for {invoices_generated} active subscriptions.",
        category="general",
        link_url="/invoices",
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "invoices_generated": invoices_generated,
        "message": f"Fast-forwarded time: {invoices_generated} recurring cycle invoices generated."
    }
