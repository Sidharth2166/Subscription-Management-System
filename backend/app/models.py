from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey,
    Text, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="staff", nullable=False) # admin, staff, customer
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="users")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    gstin = Column(String(50), nullable=True) # Indian GST Identification Number
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    status = Column(String(50), default="active") # active, inactive, archived
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="customer")
    subscriptions = relationship("Subscription", back_populates="customer", cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="customer", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False) # e.g. "Dedicated Cloud", "Multi-tenant", "Priority SLA"
    sku = Column(String(100), unique=True, nullable=False)
    price_adjustment = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    is_active = Column(Boolean, default=True)

    product = relationship("Product", back_populates="variants")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # e.g. "Starter", "Scale Up", "Enterprise Pro"
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    billing_frequency = Column(String(50), default="monthly") # daily, weekly, monthly, yearly
    min_quantity = Column(Integer, default=1)
    is_auto_close = Column(Boolean, default=False)
    allow_early_close = Column(Boolean, default=True)
    allow_pause = Column(Boolean, default=True)
    allow_renewal = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="plan")
    plan_products = relationship("PlanProduct", back_populates="plan", cascade="all, delete-orphan")


class PlanProduct(Base):
    __tablename__ = "plan_products"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    plan = relationship("Plan", back_populates="plan_products")
    product = relationship("Product")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    quotation_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="RESTRICT"), nullable=False)
    status = Column(String(50), default="draft") # draft, sent, accepted, rejected, converted
    validity_date = Column(DateTime, nullable=False)
    subtotal = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    tax_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    total_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="quotations")
    plan = relationship("Plan")
    lines = relationship("QuotationLine", back_populates="quotation", cascade="all, delete-orphan")


class QuotationLine(Base):
    __tablename__ = "quotation_lines"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    subtotal = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)

    quotation = relationship("Quotation", back_populates="lines")
    product = relationship("Product")
    variant = relationship("ProductVariant")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    subscription_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="RESTRICT"), nullable=False)
    quotation_id = Column(Integer, ForeignKey("quotations.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="active", nullable=False) # draft, quotation, confirmed, active, paused, closed
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    cancel_at_period_end = Column(Boolean, default=False)
    health_score = Column(String(50), default="healthy") # healthy, needs_attention, at_risk
    health_reason = Column(String(255), default="All invoices settled on schedule")
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")
    lines = relationship("SubscriptionLine", back_populates="subscription", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")
    history = relationship("SubscriptionStatusHistory", back_populates="subscription", cascade="all, delete-orphan")


class SubscriptionLine(Base):
    __tablename__ = "subscription_lines"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)

    subscription = relationship("Subscription", back_populates="lines")
    product = relationship("Product")
    variant = relationship("ProductVariant")


class SubscriptionStatusHistory(Base):
    __tablename__ = "subscription_status_history"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    reason = Column(String(255), nullable=True)
    changed_by = Column(String(100), default="system")
    created_at = Column(DateTime, default=datetime.utcnow)

    subscription = relationship("Subscription", back_populates="history")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    billing_period = Column(String(50), nullable=False) # e.g. "2026-10", "2026-W44"
    issue_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    subtotal = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    tax_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    total_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    amount_paid = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    amount_due = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    status = Column(String(50), default="draft", nullable=False) # draft, confirmed, paid, past_due, cancelled
    pdf_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # CRITICAL: Unique constraint to prevent duplicate invoices for the same period
    __table_args__ = (
        UniqueConstraint('subscription_id', 'billing_period', name='uq_subscription_billing_period'),
        Index('idx_invoices_customer_status', 'customer_id', 'status'),
    )

    subscription = relationship("Subscription", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    lines = relationship("InvoiceLine", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")
    attempts = relationship("PaymentAttempt", back_populates="invoice", cascade="all, delete-orphan")
    retry_schedules = relationship("RetrySchedule", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=True)
    description = Column(String(255), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    total_price = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)

    invoice = relationship("Invoice", back_populates="lines")


class TaxRule(Base):
    __tablename__ = "tax_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g. "GST (Standard Rate)"
    code = Column(String(50), unique=True, index=True, nullable=False)
    rate = Column(Numeric(5, 2), default=Decimal('18.00'), nullable=False) # 18.00%
    is_default = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)


class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    discount_type = Column(String(50), default="percentage") # percentage, fixed
    value = Column(Numeric(10, 2), default=Decimal('10.00'), nullable=False) # 10.00% or ₹500
    max_uses = Column(Integer, default=100)
    current_uses = Column(Integer, default=0)
    valid_until = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_number = Column(String(50), unique=True, index=True, nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(50), default="upi") # upi, card, bank_transfer, cash, other
    status = Column(String(50), default="success") # success, pending, failed
    reference_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    invoice = relationship("Invoice", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")


class PaymentAttempt(Base):
    __tablename__ = "payment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    attempt_number = Column(Integer, default=1, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), default="failed") # failed, succeeded
    error_message = Column(String(255), nullable=True)
    attempt_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    invoice = relationship("Invoice", back_populates="attempts")


class RetrySchedule(Base):
    __tablename__ = "retry_schedules"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    attempt_number = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="pending") # pending, executing, succeeded, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="retry_schedules")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="general") # failed_payment, retry, renewal, invoice, guardian, discount
    is_read = Column(Boolean, default=False)
    link_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True) # JSON or formatted string
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(50), primary_key=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(255), default="New Copilot Session")
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    structured_data = Column(Text, nullable=True) # JSON payload for tables, cards, charts
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
