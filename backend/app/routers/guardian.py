from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import GuardianAuditResponse
from app.services.guardian import audit_subscription_billing
from app.services.auth import require_staff

router = APIRouter(prefix="/api/guardian", tags=["Smart Billing Guardian"])

@router.get("/audit", response_model=GuardianAuditResponse)
def audit_subscription(
    subscription_id: int = Query(...),
    billing_period: str = Query(...),
    db: Session = Depends(get_db)
):
    return audit_subscription_billing(db, subscription_id, billing_period)
