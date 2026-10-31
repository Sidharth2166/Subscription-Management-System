# Subscription-Management-System
# SubFlow

**Manage subscriptions. Protect revenue. Grow smarter.**

SubFlow is a subscription management and revenue intelligence web app built for a hackathon. It covers the full billing lifecycle (products, plans, quotations, subscriptions, recurring invoices, payments) and adds tools that protect revenue: a Billing Guardian, Revenue Rescue, dunning with smart retry, proration previews and an offline AI Copilot that answers from real database queries.

The UI is a dark, premium fintech look with neon-green accents, glass panels and a 3D hero on the landing page. All amounts are in INR (₹) and stored as `Decimal`.

---

## Features

| Area | What it does |
| --- | --- |
| **Auth and roles** | JWT login and registration with bcrypt-hashed passwords. Three roles: Admin, Staff, Customer. Role checks are enforced in the backend (`require_admin`, `require_staff`, `require_customer`). |
| **Customers** | Searchable customer list and customer records with GSTIN, city and state. |
| **Products and plans** | Products with variants (price adjustments), and plans linked to products. |
| **Quotations** | Create quotations and convert them into subscriptions in one step. |
| **Subscriptions** | Lifecycle with status history, plan changes and a proration preview. |
| **Invoices** | Generated from the billing engine, with line items, tax and discounts. Downloadable as PDF (ReportLab). |
| **Payments** | Record payments and view payment history. Outstanding amounts come from stored records. |
| **Discounts and taxes** | Seeded GST rules (18% and 12%) and discount codes (percentage and fixed). |
| **Billing Guardian** | Pre-billing audit of a subscription and billing period, returning a pass/fail checklist. |
| **Revenue Rescue** | Queue of overdue and at-risk invoices with recommended actions and a send-reminder action. |
| **Dunning and retry** | Simulate a payment failure on an invoice (creates a failed attempt and retry schedule) and simulate retry success. |
| **Proration** | Preview credit, new charge and net due when changing plans, then apply the change. |
| **AI Copilot** | Chat assistant (page and floating button) using rule-based intent detection over real queries. Works fully offline. |
| **Notification Centre** | Event notifications with read and read-all actions. |
| **Analytics** | Dashboard pulse metrics for the Overview page. |
| **Customer portal** | Customers see their own subscriptions, invoices and payments. |
| **Demo tools** | A "fast-forward billing cycle" endpoint that generates invoices instantly for demos. |

The Copilot currently recognises these intents: overdue and outstanding invoices, payment failures and dunning, revenue and MRR growth, expiring subscriptions and renewals, and top plans by recurring revenue.

---

## Tech stack

**Frontend** (`frontend/`)
- React 19, TypeScript, Vite
- Tailwind CSS 3, Framer Motion, Lenis (smooth scroll)
- Recharts (charts), Lucide (icons), Sonner (toasts), cmdk (command palette)
- React Router 7, React Hook Form + Zod, TanStack Query
- Three.js with React Three Fiber and Drei (hero glass plates, with a CSS fallback)
- canvas-confetti, Oxlint

**Backend** (`backend/`)
- Python, FastAPI, Uvicorn
- SQLAlchemy 2 ORM, Pydantic 2 and pydantic-settings
- SQLite by default; PostgreSQL via the `DATABASE_URL` environment variable
- PyJWT and bcrypt for authentication
- ReportLab for PDF invoices

---

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, router registration
│   │   ├── config.py          # Settings (env-driven)
│   │   ├── database.py        # Engine, session, SQLite foreign keys
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── routers/           # HTTP endpoints, one file per resource
│   │   └── services/          # Business logic
│   │       ├── auth.py            # JWT, hashing, role guards
│   │       ├── billing_engine.py  # Recurring invoice generation
│   │       ├── guardian.py        # Pre-billing checks
│   │       ├── rescue_engine.py   # Overdue/at-risk classification
│   │       ├── proration.py       # Plan-change calculations
│   │       ├── copilot_service.py # Intent detection + queries
│   │       └── pdf_service.py     # Invoice PDFs
│   ├── seed.py                # Demo data loader
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/client.ts      # API client (reads VITE_API_URL)
    │   ├── context/           # Auth context
    │   ├── components/        # ui/, shell/, splash/, 3d/
    │   ├── pages/             # One file per screen
    │   └── utils/format.ts    # ₹ and date formatting
    ├── tailwind.config.js
    └── package.json
```

---

## Getting started

### Prerequisites
- Python 3.12 or newer
- Node.js 20 or newer and npm

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python seed.py                  # loads demo data (see warning below)
uvicorn app.main:app --reload   # http://127.0.0.1:8000
```

- Interactive API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

> **Warning:** `seed.py` drops and recreates every table before loading data. Running it again resets the database to the demo state.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

The frontend talks to `http://127.0.0.1:8000` by default. To point it elsewhere, create `frontend/.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

Other scripts:

```bash
npm run build      # type-check and production build
npm run preview    # serve the production build
npm run lint       # Oxlint
```

---

## Demo logins

All demo accounts share the password **`SubFlow#2026`**.

| Role | Email | Lands on |
| --- | --- | --- |
| Admin | `admin@subflow.dev` | Full admin app |
| Staff | `staff@subflow.dev` | Operations screens |
| Customer | `customer@subflow.dev` | Customer portal |

---

## Configuration

Settings are read from environment variables or a `backend/.env` file.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./subflow.db` | Database connection string. Set a PostgreSQL URL to switch databases. |
| `SECRET_KEY` | built-in demo key | JWT signing key. **Change this for any real deployment.** |

Access tokens expire after 7 days. Generated invoice PDFs are stored under `backend/storage/invoices`.

---

## API overview

All endpoints live under `/api`. Full details are in the Swagger docs at `/docs`.

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | `POST /login`, `POST /register`, `GET /me` |
| `/api/customers` | List, create, get, update |
| `/api/products` | List, create, add variants |
| `/api/plans` | List, create |
| `/api/quotations` | List, create, `POST /{id}/convert-to-subscription` |
| `/api/subscriptions` | List, detail, history, `GET /{id}/proration-preview`, `POST /{id}/change-plan`, `POST /{id}/status` |
| `/api/invoices` | List, detail, `POST /generate`, `GET /{id}/pdf`, `POST /{id}/simulate-failure`, `POST /{id}/simulate-retry-success` |
| `/api/payments` | List, record payment |
| `/api/guardian` | `GET /audit` |
| `/api/rescue` | `GET /summary`, `GET /queue`, `POST /send-reminder/{invoice_id}` |
| `/api/analytics` | `GET /dashboard-pulse` |
| `/api/copilot` | `POST /query`, `GET /history/{session_id}` |
| `/api/notifications` | List, mark read, mark all read |
| `/api/settings` | `GET /taxes`, `GET /discounts`, `POST /fast-forward-cycle` |

---

## Data model

Main tables: `users`, `customers`, `products`, `product_variants`, `plans`, `plan_products`, `quotations`, `quotation_lines`, `subscriptions`, `subscription_lines`, `subscription_status_history`, `invoices`, `invoice_lines`, `tax_rules`, `discounts`, `payments`, `payment_attempts`, `retry_schedules`, `notifications`, `audit_logs`, `chat_sessions`, `chat_messages`.

SQLite foreign keys are enforced through a `PRAGMA foreign_keys=ON` hook in `database.py`.

---

## Suggested demo flow

1. Open the landing page and watch the splash screen and hero.
2. Log in as **Admin** and review the Overview dashboard.
3. Open **Subscriptions**, pick one and run the **Billing Guardian** audit.
4. Open **Invoices**, simulate a payment failure, then check the **Notification Centre**.
5. Open **Revenue Rescue** to see the queue and send a reminder.
6. Simulate a retry success and confirm the balance updates.
7. Change a subscription's plan and review the **proration preview**.
8. Ask the **AI Copilot**: "How much is overdue?" or "Which subscriptions are expiring?"
9. Log in as **Customer** to show the portal and download an invoice PDF.

---

## Known limitations

- The Copilot is rule-based and covers a fixed set of intents. It does not call an LLM.
- Background scheduling for recurring billing and retries is not wired up yet; billing is triggered through the API (or the demo fast-forward endpoint).
- The backend has no automated test suite yet.
- CORS currently allows all origins, which is suitable for local demos only.

---

## Team

Built for a hackathon by the SubFlow team.
