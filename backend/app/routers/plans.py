from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Plan, PlanProduct, Product, User
from app.schemas import PlanCreate, PlanResponse
from app.services.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/plans", tags=["Plans"])

@router.get("", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    plans = db.query(Plan).order_by(Plan.id.asc()).all()
    results = []
    for p in plans:
        sub_count = len([s for s in p.subscriptions if s.status == "active"])
        calc_price = sum((pp.product.base_price for pp in p.plan_products), Decimal('0.00'))
        p_res = PlanResponse.model_validate(p)
        p_res.total_subscribers = sub_count
        p_res.calculated_price = calc_price
        results.append(p_res)
    return results

@router.post("", response_model=PlanResponse)
def create_plan(
    payload: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(Plan).filter(Plan.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plan code already exists")

    plan = Plan(
        name=payload.name,
        code=payload.code,
        description=payload.description,
        billing_frequency=payload.billing_frequency,
        min_quantity=payload.min_quantity,
        is_auto_close=payload.is_auto_close,
        allow_early_close=payload.allow_early_close,
        allow_pause=payload.allow_pause,
        allow_renewal=payload.allow_renewal,
        is_active=payload.is_active
    )
    db.add(plan)
    db.flush()

    if payload.product_ids:
        for pid in payload.product_ids:
            pp = PlanProduct(plan_id=plan.id, product_id=pid)
            db.add(pp)

    db.commit()
    db.refresh(plan)
    calc_price = sum((pp.product.base_price for pp in plan.plan_products), Decimal('0.00'))
    p_res = PlanResponse.model_validate(plan)
    p_res.total_subscribers = 0
    p_res.calculated_price = calc_price
    return p_res
