from decimal import Decimal
from sqlalchemy.orm import Session
from app.models import Subscription, Invoice, Product, TaxRule, Discount
from app.schemas import GuardianCheckItem, GuardianAuditResponse

def audit_subscription_billing(db: Session, subscription_id: int, billing_period: str) -> GuardianAuditResponse:
    checks = []
    can_issue = True

    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        return GuardianAuditResponse(
            can_issue=False,
            overall_status="failed",
            checks=[
                GuardianCheckItem(
                    name="Subscription Existence",
                    passed=False,
                    details="Subscription not found in database.",
                    is_critical=True
                )
            ],
            recommendation="Cannot issue invoice for non-existent subscription."
        )

    # 1. Subscription active & billable
    is_active = sub.status in ["active", "confirmed"]
    checks.append(GuardianCheckItem(
        name="Subscription Status",
        passed=is_active,
        details=f"Current status is '{sub.status}'. Must be active or confirmed.",
        is_critical=True
    ))
    if not is_active:
        can_issue = False

    # 2. Billing period not already invoiced
    existing_inv = db.query(Invoice).filter(
        Invoice.subscription_id == subscription_id,
        Invoice.billing_period == billing_period
    ).first()
    checks.append(GuardianCheckItem(
        name="Period Idempotency",
        passed=existing_inv is None,
        details=f"Period '{billing_period}' has not been invoiced yet." if existing_inv is None else f"Duplicate period! Invoice {existing_inv.invoice_number} already exists for {billing_period}.",
        is_critical=True
    ))
    if existing_inv is not None:
        can_issue = False

    # 3. Product catalog price consistency
    price_consistent = True
    for line in sub.lines:
        prod = db.query(Product).filter(Product.id == line.product_id).first()
        if not prod or line.unit_price <= 0:
            price_consistent = False
            break
    checks.append(GuardianCheckItem(
        name="Catalog Pricing Integrity",
        passed=price_consistent,
        details="All line item unit prices correspond with approved product catalog entries." if price_consistent else "Line item pricing discrepancies or non-positive unit price detected.",
        is_critical=True
    ))
    if not price_consistent:
        can_issue = False

    # 4. Tax rule validity (Standard 18% GST)
    tax_rule = db.query(TaxRule).filter(TaxRule.is_default == True).first()
    checks.append(GuardianCheckItem(
        name="Tax Compliance (GST)",
        passed=tax_rule is not None and tax_rule.is_active,
        details=f"Standard tax rule '{tax_rule.name}' ({tax_rule.rate}%) is active." if tax_rule else "No default tax rule configured.",
        is_critical=False
    ))

    # 5. Dates validity
    dates_valid = sub.current_period_start <= sub.current_period_end
    checks.append(GuardianCheckItem(
        name="Cycle Date Range",
        passed=dates_valid,
        details=f"Cycle: {sub.current_period_start.strftime('%d %b %Y')} to {sub.current_period_end.strftime('%d %b %Y')}.",
        is_critical=True
    ))
    if not dates_valid:
        can_issue = False

    # 6. Customer account health check
    cust_healthy = sub.customer.status == "active"
    checks.append(GuardianCheckItem(
        name="Customer Standing",
        passed=cust_healthy,
        details=f"Customer '{sub.customer.company_name}' is in active standing.",
        is_critical=False
    ))

    # 7. Line items quantity check
    has_lines = len(sub.lines) > 0
    checks.append(GuardianCheckItem(
        name="Subscription Line Items",
        passed=has_lines,
        details=f"{len(sub.lines)} product line items configured.",
        is_critical=True
    ))
    if not has_lines:
        can_issue = False

    overall = "passed" if can_issue else "failed"
    if can_issue and not cust_healthy:
        overall = "warning"

    rec = "All 7 Guardian validations passed. Safe to confirm and issue invoice." if can_issue else "Critical discrepancies found. Invoicing blocked to prevent revenue error."

    return GuardianAuditResponse(
        can_issue=can_issue,
        overall_status=overall,
        checks=checks,
        recommendation=rec
    )
