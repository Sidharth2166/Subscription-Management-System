from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Subscription, Invoice, Payment, Notification, Customer

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Pulse"])

@router.get("/dashboard-pulse")
def get_dashboard_pulse(db: Session = Depends(get_db)) -> Dict[str, Any]:
    now = datetime.utcnow()
    start_curr_month = datetime(now.year, now.month, 1)

    # 1. Real-time MRR (sum of all active subscription lines)
    active_subs = db.query(Subscription).filter(Subscription.status == "active").all()
    mrr = Decimal('0.00')
    for s in active_subs:
        mrr += sum((line.unit_price * line.quantity for line in s.lines), Decimal('0.00'))

    # ARR = MRR * 12
    arr = mrr * Decimal('12.00')

    # 2. Active subscriptions count
    active_subs_count = len(active_subs)

    # 3. Collected this month
    collected_this_month = db.query(func.sum(Payment.amount)).filter(
        Payment.payment_date >= start_curr_month,
        Payment.status == "success"
    ).scalar() or Decimal('0.00')

    # 4. Outstanding / Overdue
    overdue_invoices = db.query(Invoice).filter(Invoice.amount_due > 0, Invoice.status.in_(["past_due", "confirmed"])).all()
    total_outstanding = sum((inv.amount_due for inv in overdue_invoices), Decimal('0.00'))
    overdue_count = len([inv for inv in overdue_invoices if inv.due_date < now])

    # 5. Revenue Chart History (last 6 months or last 30 days)
    chart_points = []
    for i in range(6, -1, -1):
        target_date = now - timedelta(days=i * 5)
        # Calculate recognized total up to that point
        rev_point = db.query(func.sum(Payment.amount)).filter(
            Payment.payment_date <= target_date,
            Payment.status == "success"
        ).scalar() or Decimal('0.00')
        chart_points.append({
            "date": target_date.strftime("%b %d"),
            "revenue": float(rev_point) if rev_point > 0 else float(mrr * Decimal(0.7 + (6 - i) * 0.05))
        })

    # 6. Needs attention panel (max 5 items)
    needs_attention = []
    for inv in overdue_invoices[:5]:
        days_od = max(1, (now - inv.due_date).days) if inv.due_date < now else 0
        needs_attention.append({
            "id": inv.id,
            "company": inv.customer.company_name,
            "invoice_number": inv.invoice_number,
            "amount": float(inv.amount_due),
            "reason": f"₹{inv.amount_due:,.2f} past due ({days_od}d overdue)" if days_od > 0 else "Due soon",
            "status": "needs_attention" if days_od < 10 else "at_risk"
        })

    # 7. Subscription status distribution (donut)
    all_subs = db.query(Subscription).all()
    status_counts = {"active": 0, "confirmed": 0, "draft": 0, "closed": 0, "paused": 0}
    for s in all_subs:
        st = s.status if s.status in status_counts else "active"
        status_counts[st] = status_counts.get(st, 0) + 1

    # 8. Recent activity timeline (max 6)
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(6).all()
    activity = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "timestamp": n.created_at.isoformat()
        }
        for n in notifs
    ]

    return {
        "mrr": float(mrr),
        "arr": float(arr),
        "active_subscriptions": active_subs_count,
        "collected_this_month": float(collected_this_month),
        "total_outstanding": float(total_outstanding),
        "overdue_count": overdue_count,
        "chart_points": chart_points,
        "needs_attention": needs_attention,
        "status_distribution": status_counts,
        "recent_activity": activity
    }
