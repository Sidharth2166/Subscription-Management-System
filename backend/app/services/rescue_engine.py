from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Invoice, Customer, PaymentAttempt, RetrySchedule, Payment, Notification, Subscription
from app.schemas import RescueQueueItem

def get_rescue_summary(db: Session) -> Dict[str, Any]:
    now = datetime.utcnow()
    overdue_invoices = db.query(Invoice).filter(Invoice.status == "past_due").all()
    total_outstanding = sum((inv.amount_due for inv in overdue_invoices), Decimal('0.00'))
    
    # Recovered this month
    start_of_month = datetime(now.year, now.month, 1)
    recovered_payments = db.query(Payment).filter(
        Payment.payment_date >= start_of_month,
        Payment.status == "success"
    ).all()
    recovered_total = sum((p.amount for p in recovered_payments), Decimal('0.00'))

    # Failed attempts this month
    failed_attempts_count = db.query(PaymentAttempt).filter(
        PaymentAttempt.attempt_date >= start_of_month,
        PaymentAttempt.status == "failed"
    ).count()

    # Upcoming renewals next 7 days
    upcoming_renewals_count = db.query(Subscription).filter(
        Subscription.status == "active",
        Subscription.current_period_end <= now + timedelta(days=7),
        Subscription.current_period_end >= now
    ).count()

    return {
        "total_outstanding": total_outstanding,
        "overdue_count": len(overdue_invoices),
        "upcoming_renewals": upcoming_renewals_count,
        "failed_payments": failed_attempts_count,
        "recovered_this_month": recovered_total
    }

def get_rescue_queue(db: Session) -> List[RescueQueueItem]:
    now = datetime.utcnow()
    overdue_invoices = db.query(Invoice).filter(
        Invoice.status.in_(["past_due", "confirmed"]),
        Invoice.due_date < now,
        Invoice.amount_due > 0
    ).all()

    queue = []
    for inv in overdue_invoices:
        days_overdue = max(1, (now - inv.due_date).days)
        attempts = db.query(PaymentAttempt).filter(PaymentAttempt.invoice_id == inv.id).all()
        attempt_count = len(attempts)

        # Risk level determination based on rules:
        # > 14 days or >= 3 failed attempts = At Risk
        # 5-14 days or 1-2 failed attempts = Needs Attention
        # < 5 days = Healthy (early buffer)
        if days_overdue > 14 or attempt_count >= 3:
            risk_level = "at_risk"
            reason = f"{days_overdue} days overdue, {attempt_count} failed collection attempts"
        elif days_overdue >= 5 or attempt_count >= 1:
            risk_level = "needs_attention"
            reason = f"{days_overdue} days overdue, in automated dunning cadence"
        else:
            risk_level = "healthy"
            reason = f"Grace period: {days_overdue} days past due date"

        # Check next retry schedule
        next_retry = db.query(RetrySchedule).filter(
            RetrySchedule.invoice_id == inv.id,
            RetrySchedule.status == "pending"
        ).order_by(RetrySchedule.scheduled_date.asc()).first()

        queue.append(RescueQueueItem(
            invoice_id=inv.id,
            invoice_number=inv.invoice_number,
            customer_id=inv.customer_id,
            customer_name=inv.customer.name,
            company_name=inv.customer.company_name,
            amount=inv.amount_due,
            days_overdue=days_overdue,
            risk_level=risk_level,
            reason=reason,
            retry_attempt=attempt_count,
            max_retries=3,
            next_retry_date=next_retry.scheduled_date if next_retry else None
        ))

    # Rank queue by risk (at_risk first) then highest amount
    queue.sort(key=lambda x: (0 if x.risk_level == "at_risk" else 1 if x.risk_level == "needs_attention" else 2, -x.amount))
    return queue

def simulate_payment_failure(db: Session, invoice_id: int) -> Dict[str, Any]:
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise ValueError("Invoice not found")

    # Mark invoice past due
    inv.status = "past_due"

    # Count existing attempts
    existing_attempts = db.query(PaymentAttempt).filter(PaymentAttempt.invoice_id == inv.id).count()
    attempt_num = existing_attempts + 1

    # Record failed attempt
    attempt = PaymentAttempt(
        invoice_id=inv.id,
        attempt_number=attempt_num,
        amount=inv.amount_due,
        status="failed",
        error_message="Insufficient funds / Bank gateway decline (E042)",
        attempt_date=datetime.utcnow()
    )
    db.add(attempt)

    # Dunning Cadence Policy:
    # Attempt 1 -> retry in +1 day
    # Attempt 2 -> retry in +3 days
    # Attempt 3 -> retry in +7 days
    # Beyond attempt 3 -> mark subscription at risk
    cadence_days = {1: 1, 2: 3, 3: 7}.get(attempt_num, 7)
    next_retry_date = datetime.utcnow() + timedelta(days=cadence_days)

    if attempt_num <= 3:
        retry_sched = RetrySchedule(
            invoice_id=inv.id,
            scheduled_date=next_retry_date,
            attempt_number=attempt_num + 1,
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(retry_sched)
    else:
        # Mark subscription health at risk
        if inv.subscription:
            inv.subscription.health_score = "at_risk"
            inv.subscription.health_reason = f"Repeated payment failures ({attempt_num} attempts). Immediate intervention needed."

    # Simulated Customer Dunning Email
    email_preview = {
        "recipient": inv.customer.email,
        "subject": f"Action Required: Payment failed for Invoice {inv.invoice_number}",
        "body": f"Dear {inv.customer.name},\n\nWe could not process your automated subscription payment of ₹{inv.amount_due} for {inv.customer.company_name}.\n\nOur system will automatically retry your payment method in {cadence_days} days ({next_retry_date.strftime('%d %b %Y')}). You can also settle this instantly via your SubFlow Customer Portal.\n\nThank you,\nSubFlow Billing Team",
        "timestamp": datetime.utcnow().isoformat()
    }

    # Log in Notification Centre
    notif = Notification(
        title=f"Payment Failed: {inv.customer.company_name}",
        message=f"Attempt {attempt_num}/3 failed for {inv.invoice_number} (₹{inv.amount_due}). Next automated retry scheduled for {next_retry_date.strftime('%d %b')}.",
        category="failed_payment",
        link_url=f"/invoices/{inv.id}",
        created_at=datetime.utcnow()
    )
    db.add(notif)

    db.commit()
    db.refresh(inv)

    return {
        "status": "failure_simulated",
        "attempt_number": attempt_num,
        "next_retry_date": next_retry_date.isoformat(),
        "email_preview": email_preview
    }

def simulate_retry_success(db: Session, invoice_id: int) -> Dict[str, Any]:
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise ValueError("Invoice not found")

    # Record payment
    payment_count = db.query(Payment).count() + 1
    payment_number = f"PAY-{datetime.utcnow().year}-{payment_count:05d}"

    payment = Payment(
        payment_number=payment_number,
        invoice_id=inv.id,
        customer_id=inv.customer_id,
        amount=inv.amount_due,
        payment_method="card",
        status="success",
        reference_id=f"RETRY-SUCCESS-{DateNow()}",
        notes="Automated dunning retry recovered payment successfully",
        payment_date=datetime.utcnow()
    )
    db.add(payment)

    # Mark invoice paid
    inv.amount_paid += inv.amount_due
    inv.amount_due = Decimal('0.00')
    inv.status = "paid"

    # Mark all pending retry schedules succeeded
    schedules = db.query(RetrySchedule).filter(
        RetrySchedule.invoice_id == inv.id,
        RetrySchedule.status == "pending"
    ).all()
    for s in schedules:
        s.status = "succeeded"

    # Restore subscription health if active
    if inv.subscription:
        inv.subscription.health_score = "healthy"
        inv.subscription.health_reason = "All invoices settled on schedule"

    # Notification
    notif = Notification(
        title="Revenue Rescued!",
        message=f"Dunning retry succeeded for {inv.customer.company_name}. Recovered ₹{payment.amount} on {inv.invoice_number}.",
        category="retry",
        link_url=f"/invoices/{inv.id}",
        created_at=datetime.utcnow()
    )
    db.add(notif)

    db.commit()
    db.refresh(inv)

    return {
        "status": "retry_succeeded",
        "payment_number": payment_number,
        "amount_recovered": float(payment.amount),
        "invoice_status": inv.status
    }

def DateNow():
    return int(datetime.utcnow().timestamp())
