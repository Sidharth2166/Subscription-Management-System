from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    user_id: int
    customer_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "staff"
    customer_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    customer_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Customer Schemas -----------------
class CustomerBase(BaseModel):
    name: str
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[str] = "active"

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    active_subscriptions_count: Optional[int] = 0
    total_mrr: Optional[Decimal] = Decimal('0.00')

    class Config:
        from_attributes = True

# ----------------- Product & Variant Schemas -----------------
class ProductVariantBase(BaseModel):
    name: str
    sku: str
    price_adjustment: Decimal = Decimal('0.00')
    is_active: bool = True

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantResponse(ProductVariantBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    base_price: Decimal
    is_active: bool = True

class ProductCreate(ProductBase):
    variants: Optional[List[ProductVariantCreate]] = []

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True

# ----------------- Plan Schemas -----------------
class PlanBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    billing_frequency: str = "monthly"
    min_quantity: int = 1
    is_auto_close: bool = False
    allow_early_close: bool = True
    allow_pause: bool = True
    allow_renewal: bool = True
    is_active: bool = True

class PlanCreate(PlanBase):
    product_ids: Optional[List[int]] = []

class PlanResponse(PlanBase):
    id: int
    created_at: datetime
    total_subscribers: Optional[int] = 0
    calculated_price: Optional[Decimal] = Decimal('0.00')

    class Config:
        from_attributes = True

# ----------------- Quotation Schemas -----------------
class QuotationLineCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1
    unit_price: Decimal

class QuotationLineResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    customer_id: int
    plan_id: int
    validity_date: datetime
    lines: List[QuotationLineCreate]
    notes: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    quotation_number: str
    customer_id: int
    plan_id: int
    status: str
    validity_date: datetime
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    notes: Optional[str] = None
    created_at: datetime
    lines: List[QuotationLineResponse] = []

    class Config:
        from_attributes = True

# ----------------- Subscription Schemas -----------------
class SubscriptionLineCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1
    unit_price: Decimal

class SubscriptionLineResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    customer_id: int
    plan_id: int
    quotation_id: Optional[int] = None
    lines: List[SubscriptionLineCreate]

class SubscriptionResponse(BaseModel):
    id: int
    subscription_number: str
    customer_id: int
    plan_id: int
    quotation_id: Optional[int] = None
    status: str
    start_date: datetime
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    health_score: str
    health_reason: Optional[str] = None
    created_at: datetime
    plan_name: Optional[str] = None
    customer_name: Optional[str] = None
    mrr: Optional[Decimal] = Decimal('0.00')
    lines: List[SubscriptionLineResponse] = []

    class Config:
        from_attributes = True

# ----------------- Invoice & Payment Schemas -----------------
class InvoiceLineResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    description: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    subscription_id: int
    customer_id: int
    billing_period: str
    issue_date: datetime
    due_date: datetime
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    amount_paid: Decimal
    amount_due: Decimal
    status: str
    pdf_path: Optional[str] = None
    created_at: datetime
    customer_name: Optional[str] = None
    lines: List[InvoiceLineResponse] = []

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    invoice_id: int
    amount: Decimal
    payment_method: str = "upi"
    reference_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    payment_number: str
    invoice_id: int
    customer_id: int
    amount: Decimal
    payment_method: str
    status: str
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    payment_date: datetime

    class Config:
        from_attributes = True

# ----------------- Proration Schemas -----------------
class ProrationPreviewRequest(BaseModel):
    subscription_id: int
    new_plan_id: int

class ProrationPreviewResponse(BaseModel):
    current_plan_name: str
    new_plan_name: str
    cycle_start: datetime
    cycle_end: datetime
    days_in_cycle: int
    days_remaining: int
    days_used: int
    unused_credit: Decimal
    prorated_charge: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    net_due_today: Decimal

# ----------------- Smart Guardian Schemas -----------------
class GuardianCheckItem(BaseModel):
    name: str
    passed: bool
    details: str
    is_critical: bool

class GuardianAuditResponse(BaseModel):
    can_issue: bool
    overall_status: str # passed, warning, failed
    checks: List[GuardianCheckItem]
    recommendation: str

# ----------------- Revenue Rescue Schemas -----------------
class RescueQueueItem(BaseModel):
    invoice_id: int
    invoice_number: str
    customer_id: int
    customer_name: str
    company_name: str
    amount: Decimal
    days_overdue: int
    risk_level: str # healthy, needs_attention, at_risk
    reason: str
    retry_attempt: int
    max_retries: int
    next_retry_date: Optional[datetime] = None

# ----------------- Copilot Schemas -----------------
class CopilotMessageRequest(BaseModel):
    session_id: Optional[str] = None
    query: str

class CopilotMessageResponse(BaseModel):
    session_id: str
    answer: str
    structured_data: Optional[Any] = None
    suggested_actions: Optional[List[str]] = []
