from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Subscription, Invoice, InvoiceLine, TaxRule, Discount, Notification

def generate_invoice_for_subscription(
    db: Session,
    subscription_id: int,
    billing_period: str,
    discount_code: Optional[str] = None
) -> Invoice:
    # 1. Check idempotency: unique constraint check
    existing = db.query(Invoice).filter(
        Invoice.subscription_id == subscription_id,
        Invoice.billing_period == billing_period
    ).first()
    if existing:
        return existing

    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise ValueError(f"Subscription {subscription_id} not found")

    # Calculate subtotal from subscription lines
    subtotal = Decimal('0.00')
    line_snapshots = []

    for line in sub.lines:
        line_total = (line.unit_price * Decimal(line.quantity)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        subtotal += line_total
        line_snapshots.append({
            "product_id": line.product_id,
            "description": f"{line.product.name}" + (f" ({line.variant.name})" if line.variant else ""),
            "quantity": line.quantity,
            "unit_price": line.unit_price,
            "total_price": line_total
        })

    # If subscription lines were empty, snapshot plan products
    if not line_snapshots:
        for pp in sub.plan.plan_products:
            p_price = pp.product.base_price
            subtotal += p_price
            line_snapshots.append({
                "product_id": pp.product.id,
                "description": pp.product.name,
                "quantity": 1,
                "unit_price": p_price,
                "total_price": p_price
            })

    # 2. Apply Discount if provided
    discount_amount = Decimal('0.00')
    if discount_code:
        disc = db.query(Discount).filter(Discount.code == discount_code, Discount.is_active == True).first()
        if disc:
            if disc.discount_type == "percentage":
                discount_amount = (subtotal * (disc.value / Decimal('100.00'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            else:
                discount_amount = min(subtotal, disc.value)
            disc.current_uses += 1

    taxable_amount = max(Decimal('0.00'), subtotal - discount_amount)

    # 3. Apply Default Tax Rule (GST 18%)
    tax_rule = db.query(TaxRule).filter(TaxRule.is_default == True, TaxRule.is_active == True).first()
    tax_rate = (tax_rule.rate / Decimal('100.00')) if tax_rule else Decimal('0.18')
    tax_amount = (taxable_amount * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    total_amount = (taxable_amount + tax_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # Generate sequential invoice number
    count = db.query(Invoice).count() + 1
    invoice_number = f"INV-{datetime.utcnow().year}-{count:05d}"
    due_date = datetime.utcnow() + timedelta(days=15)

    invoice = Invoice(
        invoice_number=invoice_number,
        subscription_id=sub.id,
        customer_id=sub.customer_id,
        billing_period=billing_period,
        issue_date=datetime.utcnow(),
        due_date=due_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        amount_paid=Decimal('0.00'),
        amount_due=total_amount,
        status="confirmed",
        created_at=datetime.utcnow()
    )
    db.add(invoice)
    db.flush()

    for item in line_snapshots:
        inv_line = InvoiceLine(
            invoice_id=invoice.id,
            product_id=item["product_id"],
            description=item["description"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            total_price=item["total_price"]
        )
        db.add(inv_line)

    # Create notification
    notif = Notification(
        title="Invoice Issued",
        message=f"Invoice {invoice_number} generated for {sub.customer.company_name} (₹{total_amount}).",
        category="invoice",
        link_url=f"/invoices/{invoice.id}",
        created_at=datetime.utcnow()
    )
    db.add(notif)

    db.commit()
    db.refresh(invoice)
    return invoice
