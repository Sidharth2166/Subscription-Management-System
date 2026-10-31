// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// --- MOCK DATABASE ---
let DB = {
  users: [
    { id: 1, email: "admin@subflow.com", role: "admin" },[cite: 7, 9]
    { id: 2, email: "customer@client.com", role: "customer" }[cite: 7, 9]
  ],
  products: [
    { id: 101, name: "BrightSuite Enterprise", price: 500, variant: "Odoo Addon (+560)" }[cite: 4, 7]
  ],
  subscriptions: [
    { id: 1, customerId: 2, plan: "Monthly Enterprise", status: "Active", amount: 1060, nextBillingDate: "2026-11-01", health: "Healthy" }[cite: 4, 7]
  ],
  invoices: [
    { id: "INV-1001", subId: 1, customerId: 2, period: "2026-10", amount: 1060, status: "Paid", dueDate: "2026-10-15" },[cite: 4, 7]
    { id: "INV-1002", subId: 1, customerId: 2, period: "2026-11", amount: 1060, status: "Unpaid", dueDate: "2026-10-28" } // Overdue![cite: 4, 7]
  ]
};

// --- SMART BILLING GUARDIAN (Validation Layer) ---[cite: 7]
function checkBillingGuardian(subId, period) {
  // Check for duplicate billing period[cite: 7, 10]
  const existing = DB.invoices.find(inv => inv.subId === subId && inv.period === period);
  if (existing) {
    return { valid: false, reason: `Duplicate Billing Blocked: Invoice ${existing.id} already exists for period ${period}.` };[cite: 7, 10]
  }
  return { valid: true };
}

// --- API ENDPOINTS ---
// 1. Get Dashboard Metrics
app.get('/api/analytics/dashboard', (req, res) => {
  const mrr = DB.subscriptions.reduce((acc, s) => acc + s.amount, 0);[cite: 7, 8, 9]
  const overdueInvoices = DB.invoices.filter(i => i.status === "Unpaid");[cite: 7, 8, 9]
  const totalOutstanding = overdueInvoices.reduce((acc, i) => acc + i.amount, 0);[cite: 7, 8, 9]

  res.json({
    mrr,
    activeSubscriptions: DB.subscriptions.length,[cite: 7, 8, 9]
    totalOutstanding,
    overdueCount: overdueInvoices.length[cite: 7, 8, 9]
  });
});

// 2. Generate Invoice with Smart Billing Guardian Protection[cite: 7, 10]
app.post('/api/invoices/generate', (req, res) => {
  const { subId, period, amount } = req.body;

  // Run Guardian Validation[cite: 7]
  const guardianResult = checkBillingGuardian(subId, period);
  if (!guardianResult.valid) {
    return res.status(400).json({ error: guardianResult.reason, guardianTriggered: true });[cite: 7]
  }

  const newInvoice = {
    id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,[cite: 4, 7]
    subId,
    customerId: 2,
    period,
    amount: amount || 1060,
    status: "Draft",[cite: 4, 7]
    dueDate: "2026-11-30"
  };
  DB.invoices.push(newInvoice);
  res.status(201).json({ message: "Invoice created safely", invoice: newInvoice });
});

// 3. Revenue Rescue Action Queue Endpoint[cite: 7, 9]
app.get('/api/rescue/queue', (req, res) => {
  const issues = DB.invoices
    .filter(i => i.status === "Unpaid")[cite: 7]
    .map(i => ({
      id: i.id,
      customer: "Small Shop Enterprise",[cite: 1, 4]
      amount: i.amount,
      reason: "Invoice Overdue > 3 Days",[cite: 7]
      urgency: "HIGH",[cite: 7]
      suggestedAction: "Send One-Click Payment Reminder & Pause Renewal"[cite: 7]
    }));
  res.json(issues);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`SubFlow Backend running on port ${PORT}`));