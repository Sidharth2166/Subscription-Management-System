import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import bcrypt

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import (
    User, Customer, Product, ProductVariant, Plan, PlanProduct,
    Subscription, SubscriptionLine, SubscriptionStatusHistory,
    Invoice, InvoiceLine, TaxRule, Discount, Payment, PaymentAttempt,
    RetrySchedule, Notification
)

def get_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database():
    print("[*] Initializing SubFlow database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[*] Seeding Tax Rules & Discounts...")
        gst18 = TaxRule(name="GST (Standard SaaS)", code="GST18", rate=Decimal('18.00'), is_default=True, is_active=True)
        gst12 = TaxRule(name="GST (Concessional)", code="GST12", rate=Decimal('12.00'), is_default=False, is_active=True)
        db.add_all([gst18, gst12])

        disc_launch = Discount(code="LAUNCH20", description="Early Founder 20% Off", discount_type="percentage", value=Decimal('20.00'), max_uses=500, current_uses=12, is_active=True)
        disc_scale = Discount(code="SCALE5000", description="Scale Growth Tier Credit", discount_type="fixed", value=Decimal('5000.00'), max_uses=100, current_uses=4, is_active=True)
        db.add_all([disc_launch, disc_scale])
        db.flush()

        print("[*] Seeding 8 Enterprise Products & Variants...")
        products_data = [
            ("Core Subscription Engine", "SUB-CORE", Decimal('5000.00'), [("Standard Multi-tenant", "SUB-CORE-MT", Decimal('0.00')), ("Dedicated VPC", "SUB-CORE-VPC", Decimal('4500.00'))]),
            ("Smart Billing Guardian", "GRD-AUTO", Decimal('2500.00'), [("Pre-flight Basic", "GRD-BASIC", Decimal('0.00')), ("Deep Audit Pro", "GRD-PRO", Decimal('1800.00'))]),
            ("Revenue Rescue & Dunning", "RSC-RETRY", Decimal('3500.00'), [("Automated SMS/Email", "RSC-STD", Decimal('0.00')), ("Smart AI Gateway Cascade", "RSC-AI", Decimal('2500.00'))]),
            ("AI Business Copilot", "CPLT-BI", Decimal('4000.00'), [("Standard Queries", "CPLT-STD", Decimal('0.00')), ("Real-time Voice & Streaming", "CPLT-STREAM", Decimal('3000.00'))]),
            ("Indian GST Compliance Suite", "TAX-GST", Decimal('2000.00'), [("E-Invoicing API", "TAX-EINV", Decimal('1200.00'))]),
            ("Customer Self-Serve Portal", "PORTAL-WH", Decimal('1800.00'), [("Custom White-label Domain", "PORTAL-WL", Decimal('1500.00'))]),
            ("Advanced Financial Analytics", "ANL-REV", Decimal('3000.00'), [("Cohort & LTV Retention", "ANL-LTV", Decimal('2000.00'))]),
            ("Webhooks & Integrations", "INT-SYNC", Decimal('1500.00'), [("High Throughput 10k/sec", "INT-HT", Decimal('1500.00'))]),
        ]

        created_products = []
        for name, code, base_p, variants in products_data:
            prod = Product(name=name, code=code, base_price=base_p, is_active=True)
            db.add(prod)
            db.flush()
            created_products.append(prod)
            for v_name, v_sku, v_adj in variants:
                v = ProductVariant(product_id=prod.id, name=v_name, sku=v_sku, price_adjustment=v_adj, is_active=True)
                db.add(v)

        print("[*] Seeding 6 Subscription Plans...")
        plans_data = [
            ("Starter Venture", "PLAN-STARTER", "For pre-seed startups establishing recurring flow", "monthly", [0, 4]),
            ("Growth Scale", "PLAN-GROWTH", "For Series A companies scaling customer acquisitions", "monthly", [0, 1, 2, 4]),
            ("Enterprise Pro", "PLAN-ENTERPRISE", "Full suite with dedicated VPC and automated recovery", "monthly", [0, 1, 2, 3, 4, 5, 6, 7]),
            ("Annual Enterprise Elite", "PLAN-ANNUAL", "Billed annually with 20% built-in cashflow bonus", "yearly", [0, 1, 2, 3, 4, 5, 6, 7]),
            ("Quarterly Accelerate", "PLAN-QUARTERLY", "Quarterly audit cadence for agencies", "monthly", [0, 1, 6]),
            ("Rescue Only Tier", "PLAN-RESCUE", "Dedicated dunning and billing recovery engine", "monthly", [1, 2]),
        ]

        created_plans = []
        for p_name, p_code, p_desc, p_freq, p_prod_indices in plans_data:
            plan = Plan(name=p_name, code=p_code, description=p_desc, billing_frequency=p_freq, is_active=True)
            db.add(plan)
            db.flush()
            created_plans.append(plan)
            for idx in p_prod_indices:
                pp = PlanProduct(plan_id=plan.id, product_id=created_products[idx].id)
                db.add(pp)

        print("[*] Seeding 40 Realistic Indian Customers...")
        indian_companies = [
            ("NovaTech India", "Aarav Patel", "aarav@novatech.in", "27AABCN1234F1Z1", "Mumbai", "Maharashtra"),
            ("Zenith Cloud Labs", "Meenakshi Iyer", "meenakshi@zenithlabs.io", "29AADCB5678G1Z2", "Bengaluru", "Karnataka"),
            ("CloudOrbit Systems", "Rohan Deshmukh", "rohan@cloudorbit.tech", "27AACCB9012H1Z3", "Pune", "Maharashtra"),
            ("Veloce AI Intelligence", "Ananya Sharma", "ananya@veloce.ai", "07AAECV3456I1Z4", "New Delhi", "Delhi"),
            ("PulseWorks Fintech", "Vikram Seth", "vikram@pulseworks.in", "33AAFCP7890J1Z5", "Chennai", "Tamil Nadu"),
            ("Kavach Cyber Defense", "Aditi Rao", "aditi@kavach.security", "36AAGCK1234K1Z6", "Hyderabad", "Telangana"),
            ("Aura Healthcare Tech", "Dr. Rajesh Nair", "rajesh@auramed.in", "32AAHCA5678L1Z7", "Kochi", "Kerala"),
            ("Bharat Logistics Cloud", "Sunil Verma", "sunil@bharatlog.in", "24AAICB9012M1Z8", "Ahmedabad", "Gujarat"),
            ("AgriSense Data Labs", "Pooja Hegde", "pooja@agrisense.co", "29AAJCA3456N1Z9", "Bengaluru", "Karnataka"),
            ("UrbanFleet Electric", "Kabir Bedi", "kabir@urbanfleet.in", "27AAKCU7890O1ZA", "Mumbai", "Maharashtra"),
            ("FinBridge Payments", "Siddharth Sen", "siddharth@finbridge.io", "19AALCF1234P1ZB", "Kolkata", "West Bengal"),
            ("Zeta Analytics India", "Nidhi Kulkarni", "nidhi@zetaanalytics.in", "27AAMCZ5678Q1ZC", "Pune", "Maharashtra"),
            ("HyperStack Networks", "Arjun Reddy", "arjun@hyperstack.net", "36AANCR9012R1ZD", "Hyderabad", "Telangana"),
            ("OmniRetail OmniCloud", "Priya Menon", "priya@omniretail.in", "32AAOCR3456S1ZE", "Thiruvananthapuram", "Kerala"),
            ("CredoFlow Systems", "Gaurav Kapoor", "gaurav@credoflow.dev", "06AAPCC7890T1ZF", "Gurugram", "Haryana"),
            ("BlueSky Aviation Cloud", "Manish Tiwari", "manish@blueskyai.in", "07AAQCB1234U1ZG", "New Delhi", "Delhi"),
            ("QuantX Algorithms", "Deepika Padukone", "deepika@quantx.trade", "27AARCQ5678V1ZH", "Mumbai", "Maharashtra"),
            ("Vistara Health Informatics", "Suresh Raina", "suresh@vistarahealth.in", "29AASCU9012W1ZI", "Mysuru", "Karnataka"),
            ("Edify Learning AI", "Kriti Sanon", "kriti@edifyai.edu", "06AATCE3456X1ZJ", "Faridabad", "Haryana"),
            ("SwiftPay Terminal", "Amitabh Bachchan", "amitabh@swiftpay.in", "27AAUCB7890Y1ZK", "Mumbai", "Maharashtra"),
            ("NextWave Mobile", "Alia Bhatt", "alia@nextwave.io", "27AAVCN1234Z1ZL", "Mumbai", "Maharashtra"),
            ("SolarEdge Renewable", "Ranbir Kapoor", "ranbir@solaredge.in", "08AAWCS5678A1ZM", "Jaipur", "Rajasthan"),
            ("MetricScale SaaS", "Varun Dhawan", "varun@metricscale.co", "29AAXCM9012B1ZN", "Bengaluru", "Karnataka"),
            ("LogicPulse Automation", "Sara Ali Khan", "sara@logicpulse.dev", "27AAYCL3456C1ZO", "Pune", "Maharashtra"),
            ("Apex Gaming Cloud", "Kartik Aaryan", "kartik@apexgames.in", "07AAZCA7890D1ZP", "Noida", "Uttar Pradesh"),
            ("TruDoc Telehealth", "Tara Sutaria", "tara@trudoc.in", "29AABCT1234E1ZQ", "Bengaluru", "Karnataka"),
            ("GreenRoute Supply", "Ayushmann Khurrana", "ayushmann@greenroute.in", "03AACCG5678F1ZR", "Chandigarh", "Punjab"),
            ("InnoVibe Studio", "Shraddha Kapoor", "shraddha@innovibe.art", "27AADCI9012G1ZS", "Mumbai", "Maharashtra"),
            ("CodeSphere DevOps", "Rajkummar Rao", "rajkummar@codesphere.io", "06AAECE3456H1ZT", "Gurugram", "Haryana"),
            ("SecureID Biometrics", "Bhumi Pednekar", "bhumi@secureid.in", "27AAFCS7890I1ZU", "Navi Mumbai", "Maharashtra"),
            ("OmniPay Gateway", "Pankaj Tripathi", "pankaj@omnipay.in", "10AAGCO1234J1ZV", "Patna", "Bihar"),
            ("Zenith Dynamics", "Manoj Bajpayee", "manoj@zenithdyn.in", "27AAHCD5678K1ZW", "Nagpur", "Maharashtra"),
            ("AuraGrid Energy", "Nawazuddin Siddiqui", "nawaz@auragrid.in", "09AAICN9012L1ZX", "Lucknow", "Uttar Pradesh"),
            ("SkyVault Backups", "Jaideep Ahlawat", "jaideep@skyvault.io", "06AAJCS3456M1ZY", "Rohtak", "Haryana"),
            ("DataSprint ETL", "Radhika Apte", "radhika@datasprint.dev", "27AAKCD7890N1ZZ", "Pune", "Maharashtra"),
            ("PixelCraft Visuals", "Vijay Varma", "vijay@pixelcraft.studio", "36AALCP1234O1Z0", "Hyderabad", "Telangana"),
            ("CloudShield SOC", "Kareena Kapoor", "kareena@cloudshield.in", "27AAMCC5678P1Z1", "Mumbai", "Maharashtra"),
            ("BioGenome Tech", "Saif Ali Khan", "saif@biogenome.org", "29AANCB9012Q1Z2", "Bengaluru", "Karnataka"),
            ("AlphaQuant AI", "Hrithik Roshan", "hrithik@alphaquant.in", "27AAOCA3456R1Z3", "Mumbai", "Maharashtra"),
            ("IndoCloud Infra", "Shah Rukh Khan", "srk@indocloud.in", "27AAPCI7890S1Z4", "Mumbai", "Maharashtra"),
        ]

        created_customers = []
        for comp, name, email, gstin, city, state in indian_companies:
            cust = Customer(
                name=name,
                company_name=comp,
                email=email,
                phone="+91 98" + "".join([str(i % 10) for i in range(8)]),
                gstin=gstin,
                address="Level 4, Cyber Park",
                city=city,
                state=state,
                postal_code="560001",
                status="active",
                created_at=datetime.utcnow() - timedelta(days=180)
            )
            db.add(cust)
            created_customers.append(cust)
        db.flush()

        print("[*] Seeding Demo Users (Admin, Staff, Customer)...")
        demo_pwd_hash = get_hash("SubFlow#2026")

        admin_user = User(name="Meenakshi Iyer (Admin)", email="admin@subflow.dev", hashed_password=demo_pwd_hash, role="admin")
        staff_user = User(name="Rohan Deshmukh (Staff)", email="staff@subflow.dev", hashed_password=demo_pwd_hash, role="staff")
        cust_user = User(name="Aarav Patel (Customer)", email="customer@subflow.dev", hashed_password=demo_pwd_hash, role="customer", customer_id=created_customers[0].id)
        db.add_all([admin_user, staff_user, cust_user])

        print("[*] Seeding Subscriptions, 12 Months Invoices, and Overdue Scenarios...")
        now = datetime.utcnow()

        for idx, cust in enumerate(created_customers):
            plan = created_plans[idx % len(created_plans)]
            sub_num = f"SUB-2026-{(idx + 1):05d}"
            
            # Diverse health states
            if idx in [2, 3]: # CloudOrbit, Veloce
                health = "at_risk"
                health_reason = "2 payment attempts failed, dunning retry scheduled"
                status = "active"
            elif idx in [4, 5]: # PulseWorks, Kavach
                health = "needs_attention"
                health_reason = "Invoice past due date, reminder dispatched"
                status = "active"
            elif idx == 38: # AlphaQuant
                health = "healthy"
                health_reason = "New registration"
                status = "draft"
            elif idx == 39: # IndoCloud
                health = "healthy"
                health_reason = "Terminated upon contract completion"
                status = "closed"
            else:
                health = "healthy"
                health_reason = "All invoices settled on schedule"
                status = "active"

            sub = Subscription(
                subscription_number=sub_num,
                customer_id=cust.id,
                plan_id=plan.id,
                status=status,
                start_date=now - timedelta(days=90),
                current_period_start=now - timedelta(days=15),
                current_period_end=now + timedelta(days=15),
                health_score=health,
                health_reason=health_reason,
                created_at=now - timedelta(days=90)
            )
            db.add(sub)
            db.flush()

            # Add subscription line items
            for pp in plan.plan_products:
                s_line = SubscriptionLine(
                    subscription_id=sub.id,
                    product_id=pp.product.id,
                    quantity=1,
                    unit_price=pp.product.base_price
                )
                db.add(s_line)

            # Generate past invoices for each month of history
            subtotal = sum((pp.product.base_price for pp in plan.plan_products), Decimal('0.00'))
            tax = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))
            total = subtotal + tax

            # 1. Past settled invoice (2 months ago)
            inv1 = Invoice(
                invoice_number=f"INV-2026-{(idx * 3 + 1):05d}",
                subscription_id=sub.id,
                customer_id=cust.id,
                billing_period="2026-08",
                issue_date=now - timedelta(days=60),
                due_date=now - timedelta(days=45),
                subtotal=subtotal,
                tax_amount=tax,
                discount_amount=Decimal('0.00'),
                total_amount=total,
                amount_paid=total,
                amount_due=Decimal('0.00'),
                status="paid",
                created_at=now - timedelta(days=60)
            )
            db.add(inv1)
            db.flush()
            p1 = Payment(
                payment_number=f"PAY-2026-{(idx * 2 + 1):05d}",
                invoice_id=inv1.id,
                customer_id=cust.id,
                amount=total,
                payment_method="bank_transfer",
                status="success",
                reference_id=f"HDFC-{idx}8911",
                payment_date=now - timedelta(days=50)
            )
            db.add(p1)

            # 2. Current Month Invoice
            if idx in [2, 3]: # Overdue failed accounts for Dunning Demo
                inv_curr = Invoice(
                    invoice_number=f"INV-2026-{(idx * 3 + 2):05d}",
                    subscription_id=sub.id,
                    customer_id=cust.id,
                    billing_period="2026-10",
                    issue_date=now - timedelta(days=12),
                    due_date=now - timedelta(days=2),
                    subtotal=subtotal,
                    tax_amount=tax,
                    discount_amount=Decimal('0.00'),
                    total_amount=total,
                    amount_paid=Decimal('0.00'),
                    amount_due=total,
                    status="past_due",
                    created_at=now - timedelta(days=12)
                )
                db.add(inv_curr)
                db.flush()

                # Add failed payment attempt
                pa1 = PaymentAttempt(
                    invoice_id=inv_curr.id,
                    attempt_number=1,
                    amount=total,
                    status="failed",
                    error_message="Card authorization decline (Do not honor)",
                    attempt_date=now - timedelta(days=2)
                )
                db.add(pa1)
                rs1 = RetrySchedule(
                    invoice_id=inv_curr.id,
                    scheduled_date=now + timedelta(days=1),
                    attempt_number=2,
                    status="pending"
                )
                db.add(rs1)
            else: # Settled or confirmed
                inv_curr = Invoice(
                    invoice_number=f"INV-2026-{(idx * 3 + 2):05d}",
                    subscription_id=sub.id,
                    customer_id=cust.id,
                    billing_period="2026-10",
                    issue_date=now - timedelta(days=10),
                    due_date=now + timedelta(days=5),
                    subtotal=subtotal,
                    tax_amount=tax,
                    discount_amount=Decimal('0.00'),
                    total_amount=total,
                    amount_paid=total,
                    amount_due=Decimal('0.00'),
                    status="paid",
                    created_at=now - timedelta(days=10)
                )
                db.add(inv_curr)
                db.flush()
                p_curr = Payment(
                    payment_number=f"PAY-2026-{(idx * 2 + 2):05d}",
                    invoice_id=inv_curr.id,
                    customer_id=cust.id,
                    amount=total,
                    payment_method="upi",
                    status="success",
                    reference_id=f"UPI-{idx}7712",
                    payment_date=now - timedelta(days=8)
                )
                db.add(p_curr)

        print("[*] Seeding Notification Centre Feed...")
        notifs_seed = [
            ("Payment Failed", "Attempt 1/3 failed for CloudOrbit Technologies (INV-2026-00008). Retrying in 24h.", "failed_payment", "/invoices/8"),
            ("Smart Guardian Audit", "Pre-flight validation verified 7 checks for NovaTech India. Issued INV-2026-00002.", "guardian", "/invoices/2"),
            ("Upcoming Renewal", "Zenith Cloud Labs subscription renewing in 4 days.", "renewal", "/subscriptions/2"),
            ("Revenue Rescued", "Dunning cadence recovered ₹45,000.00 from PulseWorks Fintech.", "retry", "/invoices/5"),
            ("Proration Applied", "Customer upgraded to Enterprise Pro. Net adjustment credit memo generated.", "general", "/subscriptions/1"),
        ]
        for title, msg, cat, link in notifs_seed:
            n = Notification(title=title, message=msg, category=cat, link_url=link, created_at=now - timedelta(hours=2))
            db.add(n)

        db.commit()
        print("[+] Database successfully seeded with 40 customers, active MRR ledger, and demo credentials!")

    except Exception as e:
        db.rollback()
        print(f"[-] Seeding error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
