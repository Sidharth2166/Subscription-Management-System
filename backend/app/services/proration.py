from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from app.models import Subscription, Plan, TaxRule, SubscriptionStatusHistory, Invoice, InvoiceLine
from app.schemas import ProrationPreviewResponse

def calculate_proration_preview(
    db: Session,
    subscription_id: int,
    new_plan_id: int
) -> ProrationPreviewResponse:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise ValueError(f"Subscription {subscription_id} not found")

    new_plan = db.query(Plan).filter(Plan.id == new_plan_id).first()
    if not new_plan:
        raise ValueError(f"Plan {new_plan_id} not found")

    # Current plan price based on subscription lines
    current_plan_total = sum((line.unit_price * line.quantity for line in sub.lines), Decimal('0.00'))
    if current_plan_total == 0:
        # Fallback to sum of products in old plan if lines empty
        current_plan_total = sum((pp.product.base_price for pp in sub.plan.plan_products), Decimal('0.00'))

    # New plan total
    new_plan_total = sum((pp.product.base_price for pp in new_plan.plan_products), Decimal('0.00'))
    if new_plan_total == 0:
        new_plan_total = current_plan_total * Decimal('1.5') # Demo fallback

    now = datetime.utcnow()
    cycle_start = sub.current_period_start
    cycle_end = sub.current_period_end

    total_cycle_seconds = max(1, (cycle_end - cycle_start).total_seconds())
    days_in_cycle = max(1, (cycle_end - cycle_start).days)
    
    # Days elapsed vs remaining
    elapsed_seconds = max(0, min(total_cycle_seconds, (now - cycle_start).total_seconds()))
    days_used = max(0, min(days_in_cycle, int(elapsed_seconds // 86400)))
    days_remaining = max(0, days_in_cycle - days_used)

    # Fractions with Decimal precision
    fraction_remaining = Decimal(days_remaining) / Decimal(days_in_cycle)

    # Unused credit for old plan
    unused_credit = (current_plan_total * fraction_remaining).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # Prorated charge for new plan
    prorated_charge = (new_plan_total * fraction_remaining).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # Tax rule (Standard GST 18%)
    tax_rule = db.query(TaxRule).filter(TaxRule.is_default == True).first()
    tax_rate = (tax_rule.rate / Decimal('100.00')) if tax_rule else Decimal('0.18')

    raw_net = prorated_charge - unused_credit
    if raw_net > Decimal('0.00'):
        tax_amount = (raw_net * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        net_due_today = (raw_net + tax_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    else:
        tax_amount = Decimal('0.00')
        net_due_today = Decimal('0.00')

    return ProrationPreviewResponse(
        current_plan_name=sub.plan.name,
        new_plan_name=new_plan.name,
        cycle_start=cycle_start,
        cycle_end=cycle_end,
        days_in_cycle=days_in_cycle,
        days_remaining=days_remaining,
        days_used=days_used,
        unused_credit=unused_credit,
        prorated_charge=prorated_charge,
        tax_amount=tax_amount,
        discount_amount=Decimal('0.00'),
        net_due_today=net_due_today
    )

def execute_plan_change(
    db: Session,
    subscription_id: int,
    new_plan_id: int,
    user_name: str = "system"
) -> Subscription:
    preview = calculate_proration_preview(db, subscription_id, new_plan_id)
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    old_plan_name = sub.plan.name
    new_plan = db.query(Plan).filter(Plan.id == new_plan_id).first()

    # Log status history
    history = SubscriptionStatusHistory(
        subscription_id=sub.id,
        from_status=sub.status,
        to_status=sub.status,
        reason=f"Plan upgraded from '{old_plan_name}' to '{new_plan.name}'. Proration net due: ₹{preview.net_due_today}",
        changed_by=user_name,
        created_at=datetime.utcnow()
    )
    db.add(history)

    # Update subscription plan
    sub.plan_id = new_plan_id

    # If there is net due, create an adjustment invoice
    if preview.net_due_today > 0:
        inv_count = db.query(Invoice).count() + 1
        inv_number = f"INV-ADJ-{datetime.utcnow().year}-{inv_count:04d}"
        inv = Invoice(
            invoice_number=inv_number,
            subscription_id=sub.id,
            customer_id=sub.customer_id,
            billing_period=f"{datetime.utcnow().strftime('%Y-%m')}-PRORATE",
            issue_date=datetime.utcnow(),
            due_date=datetime.utcnow(),
            subtotal=preview.prorated_charge - preview.unused_credit,
            tax_amount=preview.tax_amount,
            discount_amount=Decimal('0.00'),
            total_amount=preview.net_due_today,
            amount_paid=Decimal('0.00'),
            amount_due=preview.net_due_today,
            status="confirmed",
            created_at=datetime.utcnow()
        )
        db.add(inv)
        db.flush()

        line1 = InvoiceLine(
            invoice_id=inv.id,
            description=f"Prorated upgrade to {new_plan.name} ({preview.days_remaining} days)",
            quantity=1,
            unit_price=preview.prorated_charge,
            total_price=preview.prorated_charge
        )
        line2 = InvoiceLine(
            invoice_id=inv.id,
            description=f"Unused credit from {old_plan_name} ({preview.days_remaining} days)",
            quantity=1,
            unit_price=-preview.unused_credit,
            total_price=-preview.unused_credit
        )
        db.add_all([line1, line2])

    db.commit()
    db.refresh(sub)
    return sub
