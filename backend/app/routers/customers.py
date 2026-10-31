from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Customer, Subscription, User
from app.schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.auth import get_current_user, require_staff

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Customer)
    
    # Customer role isolation: customer can only see their own company
    if current_user and current_user.role == "customer" and current_user.customer_id:
        query = query.filter(Customer.id == current_user.customer_id)

    if search:
        s = f"%{search}%"
        query = query.filter((Customer.name.ilike(s)) | (Customer.company_name.ilike(s)) | (Customer.email.ilike(s)))
    if status:
        query = query.filter(Customer.status == status)

    customers = query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for c in customers:
        active_subs = [s for s in c.subscriptions if s.status == "active"]
        total_mrr = sum(
            (sum((line.unit_price * line.quantity for line in s.lines), Decimal('0.00')) for s in active_subs),
            Decimal('0.00')
        )
        c_res = CustomerResponse.model_validate(c)
        c_res.active_subscriptions_count = len(active_subs)
        c_res.total_mrr = total_mrr
        result.append(c_res)

    return result

@router.post("", response_model=CustomerResponse)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    existing = db.query(Customer).filter(Customer.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")

    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user and current_user.role == "customer" and current_user.customer_id != customer_id:
        raise HTTPException(status_code=403, detail="Access denied")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    active_subs = [s for s in customer.subscriptions if s.status == "active"]
    total_mrr = sum(
        (sum((line.unit_price * line.quantity for line in s.lines), Decimal('0.00')) for s in active_subs),
        Decimal('0.00')
    )
    c_res = CustomerResponse.model_validate(customer)
    c_res.active_subscriptions_count = len(active_subs)
    c_res.total_mrr = total_mrr
    return c_res

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)
    return customer
