from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Subscription, SubscriptionStatusHistory, User
from app.schemas import (
    SubscriptionResponse, SubscriptionCreate,
    ProrationPreviewRequest, ProrationPreviewResponse
)
from app.services.auth import get_current_user, require_staff
from app.services.proration import calculate_proration_preview, execute_plan_change

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("", response_model=List[SubscriptionResponse])
def get_subscriptions(
    status: Optional[str] = None,
    health: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Subscription)

    if current_user and current_user.role == "customer" and current_user.customer_id:
        query = query.filter(Subscription.customer_id == current_user.customer_id)

    if status:
        query = query.filter(Subscription.status == status)
    if health:
        query = query.filter(Subscription.health_score == health)

    subs = query.order_by(Subscription.created_at.desc()).all()
    results = []
    for s in subs:
        mrr = sum((line.unit_price * line.quantity for line in s.lines), Decimal('0.00'))
        res = SubscriptionResponse.model_validate(s)
        res.plan_name = s.plan.name if s.plan else "Unknown"
        res.customer_name = s.customer.company_name if s.customer else "Unknown"
        res.mrr = mrr
        results.append(res)
    return results

@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def get_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    if current_user and current_user.role == "customer" and current_user.customer_id != sub.customer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    mrr = sum((line.unit_price * line.quantity for line in sub.lines), Decimal('0.00'))
    res = SubscriptionResponse.model_validate(sub)
    res.plan_name = sub.plan.name if sub.plan else "Unknown"
    res.customer_name = sub.customer.company_name if sub.customer else "Unknown"
    res.mrr = mrr
    return res

@router.get("/{subscription_id}/history")
def get_subscription_history(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    history = db.query(SubscriptionStatusHistory).filter(
        SubscriptionStatusHistory.subscription_id == subscription_id
    ).order_by(SubscriptionStatusHistory.created_at.desc()).all()
    return history

@router.get("/{subscription_id}/proration-preview", response_model=ProrationPreviewResponse)
def preview_proration(
    subscription_id: int,
    new_plan_id: int = Query(...),
    db: Session = Depends(get_db)
):
    try:
        preview = calculate_proration_preview(db, subscription_id, new_plan_id)
        return preview
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{subscription_id}/change-plan")
def change_plan(
    subscription_id: int,
    new_plan_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_name = current_user.name if current_user else "staff"
    try:
        updated = execute_plan_change(db, subscription_id, new_plan_id, user_name)
        return {
            "status": "success",
            "subscription_id": updated.id,
            "new_plan_id": updated.plan_id,
            "message": f"Successfully updated subscription to {updated.plan.name}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{subscription_id}/status")
def update_status(
    subscription_id: int,
    new_status: str = Query(...), # active, paused, closed
    reason: Optional[str] = Query("Status modified by user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    old_status = sub.status
    sub.status = new_status

    history = SubscriptionStatusHistory(
        subscription_id=sub.id,
        from_status=old_status,
        to_status=new_status,
        reason=reason,
        changed_by=current_user.name if current_user else "user",
        created_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()

    return {"status": "success", "from_status": old_status, "to_status": new_status}
