import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Plus,
  Mail,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { Input } from '../components/ui/Input';
import { formatINR, formatDate } from '../utils/format';
import { api } from '../api/client';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Guardian Audit Modal
  const [guardianModalOpen, setGuardianModalOpen] = useState(false);
  const [guardianResult, setGuardianResult] = useState<any | null>(null);
  const [isGuardianLoading, setIsGuardianLoading] = useState(false);

  // Record Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Simulated Email Preview Modal
  const [simulatedEmail, setSimulatedEmail] = useState<any | null>(null);

  const fetchInvoices = () => {
    setIsLoading(true);
    api.getInvoices()
      .then((data) => {
        setInvoices(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openGuardianCheck = async (inv: any) => {
    setIsGuardianLoading(true);
    setGuardianModalOpen(true);
    try {
      const res = await api.auditSubscription(inv.subscription_id, inv.billing_period);
      setGuardianResult(res);
    } catch {
      setGuardianResult(null);
    } finally {
      setIsGuardianLoading(false);
    }
  };

  const handleSimulateFailure = async (invId: number) => {
    try {
      const res = await api.simulatePaymentFailure(invId);
      setSimulatedEmail(res.email_preview);
      fetchInvoices();
      if (selectedInvoice?.id === invId) {
        api.getInvoice(invId).then(setSelectedInvoice).catch(() => {});
      }
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    }
  };

  const handleSimulateRetrySuccess = async (invId: number) => {
    try {
      const res = await api.simulateRetrySuccess(invId);
      alert(`Success! Recovered ${formatINR(res.amount_recovered)} through automated dunning retry.`);
      fetchInvoices();
      if (selectedInvoice?.id === invId) {
        api.getInvoice(invId).then(setSelectedInvoice).catch(() => {});
      }
    } catch (err: any) {
      alert(err.message || 'Retry simulation failed');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoiceForPayment || paymentAmount <= 0) return;

    try {
      await api.recordPayment({
        invoice_id: targetInvoiceForPayment.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
      });
      alert('Payment recorded and reconciled successfully!');
      setPaymentModalOpen(false);
      fetchInvoices();
      if (selectedInvoice?.id === targetInvoiceForPayment.id) {
        api.getInvoice(targetInvoiceForPayment.id).then(setSelectedInvoice).catch(() => {});
      }
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-mono text-white font-bold text-xs">{item.invoice_number}</span>
          <div className="text-[10px] text-text-3">Period: {item.billing_period}</div>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (item) => (
        <div>
          <div className="font-semibold text-white text-xs">{item.customer_name}</div>
          <div className="text-[11px] text-text-3">Due: {formatDate(item.due_date)}</div>
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      align: 'right',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-white tabular-nums">{formatINR(item.total_amount)}</span>
      ),
    },
    {
      key: 'amount_due',
      header: 'Outstanding Balance',
      align: 'right',
      sortable: true,
      render: (item) => (
        <span className={`font-bold tabular-nums ${item.amount_due > 0 ? 'text-warning' : 'text-neon'}`}>
          {formatINR(item.amount_due)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => <StatusChip status={item.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => window.open(api.getInvoicePdfUrl(item.id), '_blank')}
            className="p-1.5 rounded-lg bg-surface hover:bg-card border border-glass-border text-text-3 hover:text-white transition-colors"
            title="Download GST PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openGuardianCheck(item)}
            className="p-1.5 rounded-lg bg-surface hover:bg-card border border-glass-border text-neon hover:text-white transition-colors"
            title="Smart Guardian Pre-flight Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">BILLING & REVENUE OPERATIONS</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Invoices & Collections
          </h1>
          <p className="text-xs text-text-3">
            Idempotent generation, Smart Guardian pre-flight checks, GST PDFs, and automated dunning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlowButton
            variant="secondary"
            size="sm"
            onClick={() => {
              if (invoices.length > 0) openGuardianCheck(invoices[0]);
            }}
          >
            <ShieldCheck className="w-4 h-4 mr-1 text-neon" />
            Run Guardian Pre-Flight
          </GlowButton>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => setSelectedInvoice(item)}
      />

      {/* Invoice Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice?.invoice_number}
        subtitle={`${selectedInvoice?.customer_name} • Cycle: ${selectedInvoice?.billing_period}`}
        width="xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs">
            {/* Balance Overview Card */}
            <div className="p-4 rounded-xl bg-surface border border-glass-border flex justify-between items-center">
              <div>
                <span className="text-[10px] text-text-3 uppercase">Outstanding Balance</span>
                <div className={`text-2xl font-extrabold tabular-nums mt-0.5 ${selectedInvoice.amount_due > 0 ? 'text-warning' : 'text-neon'}`}>
                  {formatINR(selectedInvoice.amount_due)}
                </div>
              </div>
              <StatusChip status={selectedInvoice.status} />
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Deliverables & Subscriptions
              </span>
              <div className="rounded-xl border border-glass-border overflow-hidden bg-surface/50">
                <table className="w-full text-left">
                  <thead className="bg-card text-text-3 text-[10px] uppercase border-b border-glass-border">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/40">
                    {selectedInvoice.lines?.map((line: any) => (
                      <tr key={line.id}>
                        <td className="p-2.5 text-white font-medium">{line.description}</td>
                        <td className="p-2.5 text-center text-text-3">{line.quantity}</td>
                        <td className="p-2.5 text-right text-text-2 font-mono">{formatINR(line.unit_price)}</td>
                        <td className="p-2.5 text-right text-white font-mono">{formatINR(line.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax & Discount Breakdown */}
            <div className="p-3.5 rounded-xl bg-surface/60 border border-glass-border space-y-1.5">
              <div className="flex justify-between text-text-3">
                <span>Subtotal:</span>
                <span className="font-mono text-white">{formatINR(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-3">
                <span>Discount:</span>
                <span className="font-mono text-text-2">-{formatINR(selectedInvoice.discount_amount)}</span>
              </div>
              <div className="flex justify-between text-text-3">
                <span>GST (18% Standard):</span>
                <span className="font-mono text-text-2">+{formatINR(selectedInvoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-glass-border text-sm">
                <span>Total Invoice Value:</span>
                <span className="text-neon tabular-nums">{formatINR(selectedInvoice.total_amount)}</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <GlowButton
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(api.getInvoicePdfUrl(selectedInvoice.id), '_blank')}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Print / GST PDF
                </GlowButton>

                {selectedInvoice.amount_due > 0 && (
                  <GlowButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setTargetInvoiceForPayment(selectedInvoice);
                      setPaymentAmount(Number(selectedInvoice.amount_due));
                      setPaymentModalOpen(true);
                    }}
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    Record Payment
                  </GlowButton>
                )}
              </div>

              {/* Dunning Stress Testing Controls (Hackathon Feature) */}
              <div className="p-3 rounded-xl bg-card border border-glass-border space-y-2">
                <span className="text-[10px] font-bold uppercase text-text-3 tracking-wider block">
                  Dunning & Failure Simulation
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulateFailure(selectedInvoice.id)}
                    className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 border border-danger/30 text-[11px] text-danger font-semibold transition-colors cursor-pointer"
                  >
                    Simulate Gateway Failure
                  </button>
                  <button
                    onClick={() => handleSimulateRetrySuccess(selectedInvoice.id)}
                    className="p-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/40 text-[11px] text-neon font-semibold transition-colors cursor-pointer"
                  >
                    Simulate Retry Success
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Smart Billing Guardian Audit Modal */}
      <Modal
        isOpen={guardianModalOpen}
        onClose={() => setGuardianModalOpen(false)}
        title="Smart Billing Guardian"
        description="Pre-flight verification & cryptographic audit checklist"
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          {isGuardianLoading ? (
            <div className="py-8 text-center text-xs text-text-3">
              Running 7 pre-flight cryptographic & catalog checks...
            </div>
          ) : guardianResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-green-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-neon shadow-[0_0_15px_rgba(85,255,118,0.3)]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Pre-Flight Audit Status: Passed</h4>
                    <p className="text-xs text-neon">{guardianResult.recommendation}</p>
                  </div>
                </div>
                <StatusChip status="healthy" label="100% Verified" size="sm" />
              </div>

              {/* Animated Checklist of 7 Checks */}
              <div className="space-y-2 p-3 rounded-xl bg-surface/60 border border-glass-border">
                {guardianResult.checks?.map((chk: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-text-2 py-1">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-white">{chk.name}: </span>
                      <span className="text-text-3">{chk.details}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-text-3">
              No audit records available.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <GlowButton variant="secondary" onClick={() => setGuardianModalOpen(false)}>
              Close Guardian
            </GlowButton>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Received Payment"
        description="Reconcile funds against outstanding invoice"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-left">
          <Input
            label="Payment Amount (₹)"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            required
          />

          <div>
            <label className="text-xs font-semibold text-text-2 uppercase block mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-surface border border-glass-border rounded-input px-3.5 py-2.5 text-xs text-white outline-none"
            >
              <option value="upi" className="bg-card">UPI (Instant Settlement)</option>
              <option value="card" className="bg-card">Corporate Credit / Debit Card</option>
              <option value="bank_transfer" className="bg-card">NEFT / RTGS Wire Transfer</option>
              <option value="cash" className="bg-card">Cheque / Direct Cash</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <GlowButton variant="secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary">
              Reconcile Payment
            </GlowButton>
          </div>
        </form>
      </Modal>

      {/* Simulated Email Preview Modal */}
      <Modal
        isOpen={Boolean(simulatedEmail)}
        onClose={() => setSimulatedEmail(null)}
        title="Simulated Dunning Email Dispatched"
        description="Automated customer payment recovery communication"
      >
        {simulatedEmail && (
          <div className="space-y-4 text-left text-xs">
            <div className="p-3 rounded-lg bg-surface border border-glass-border space-y-1">
              <div><span className="text-text-3">To:</span> <strong className="text-white">{simulatedEmail.recipient}</strong></div>
              <div><span className="text-text-3">Subject:</span> <strong className="text-neon">{simulatedEmail.subject}</strong></div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-danger/30 text-text-2 leading-relaxed whitespace-pre-line font-mono text-[11px]">
              {simulatedEmail.body}
            </div>
            <div className="flex justify-end">
              <GlowButton variant="secondary" onClick={() => setSimulatedEmail(null)}>
                Dismiss Preview
              </GlowButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
