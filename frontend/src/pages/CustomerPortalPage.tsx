import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Download,
  CreditCard,
  Sliders,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate } from '../utils/format';
import { api } from '../api/client';

export const CustomerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Change Plan Modal
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [newPlanId, setNewPlanId] = useState<number | null>(null);
  const [prorationPreview, setProrationPreview] = useState<any | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getSubscriptions(),
      api.getInvoices(),
      api.getPayments(),
      api.getPlans(),
    ])
      .then(([subs, invs, pays, plns]) => {
        setSubscriptions(subs);
        setInvoices(invs);
        setPayments(pays);
        setPlans(plns);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const activeSub = subscriptions.find((s) => s.status === 'active') || subscriptions[0];

  const handleOpenChangePlan = () => {
    if (!activeSub) return;
    const available = plans.filter((p) => p.id !== activeSub.plan_id);
    const firstPlan = available.length > 0 ? available[0].id : null;
    setNewPlanId(firstPlan);
    setChangePlanOpen(true);
    if (firstPlan) {
      api.getProrationPreview(activeSub.id, firstPlan).then(setProrationPreview).catch(() => {});
    }
  };

  const handleSelectPlan = (planId: number) => {
    setNewPlanId(planId);
    if (activeSub) {
      api.getProrationPreview(activeSub.id, planId).then(setProrationPreview).catch(() => {});
    }
  };

  const executeChangePlan = async () => {
    if (!activeSub || !newPlanId) return;
    try {
      await api.changePlan(activeSub.id, newPlanId);
      alert('Your subscription plan has been upgraded successfully!');
      setChangePlanOpen(false);
      api.getSubscriptions().then(setSubscriptions);
    } catch {
      alert('Plan change failed');
    }
  };

  const outstandingTotal = invoices.reduce((sum, inv) => sum + Number(inv.amount_due || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-left select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-glass-border">
        <div>
          <span className="eyebrow-text block mb-1">CLIENT SELF-SERVE PORTAL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Welcome, <span className="neon-text">{user?.name || 'Aarav Patel'}</span>
          </h1>
          <p className="text-xs text-text-3">
            Manage your corporate subscription, view tax invoices, and explore plan upgrades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusChip status="healthy" label="Account In Good Standing" />
        </div>
      </div>

      {/* ACTIVE SUBSCRIPTION HERO CARD */}
      {activeSub && (
        <GlassCard variant="bottom-glow" className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] text-neon font-mono uppercase tracking-widest block mb-1">
                ACTIVE SUBSCRIPTION CONTRACT
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {activeSub.plan_name}
              </h2>
              <p className="text-xs text-text-3 mt-1 font-mono">
                Subscription Ref: {activeSub.subscription_number}
              </p>
            </div>

            <GlowButton variant="primary" size="sm" onClick={handleOpenChangePlan}>
              <Sliders className="w-3.5 h-3.5 mr-1" />
              Upgrade / Change Tier
            </GlowButton>
          </div>

          {/* Key Metric Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surface/80 border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase block font-semibold">Contracted Monthly Rate</span>
              <div className="text-2xl font-bold text-neon mt-1 tabular-nums">
                {formatINR(activeSub.mrr)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface/80 border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase block font-semibold">Next Scheduled Renewal</span>
              <div className="text-xl font-bold text-white mt-1">
                {formatDate(activeSub.current_period_end)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface/80 border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase block font-semibold">Outstanding Due</span>
              <div className={`text-xl font-bold mt-1 tabular-nums ${outstandingTotal > 0 ? 'text-warning' : 'text-neon'}`}>
                {formatINR(outstandingTotal)}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* RECENT INVOICES & GST PDF DOWNLOADS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Recent Tax Invoices</h3>
          <span className="text-xs text-text-3">All invoices include Indian GST (18%) breakdown</span>
        </div>

        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface/90 text-text-3 text-[10px] uppercase border-b border-glass-border">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Billing Period</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">PDF Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface/40 transition-colors">
                    <td className="p-3.5 font-mono text-white font-semibold">{inv.invoice_number}</td>
                    <td className="p-3.5 text-text-3">{inv.billing_period}</td>
                    <td className="p-3.5 text-text-2">{formatDate(inv.due_date)}</td>
                    <td className="p-3.5 text-right font-bold text-white tabular-nums">{formatINR(inv.total_amount)}</td>
                    <td className="p-3.5 text-center">
                      <StatusChip status={inv.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => window.open(api.getInvoicePdfUrl(inv.id), '_blank')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface hover:bg-card border border-glass-border text-neon text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* CHANGE PLAN PRORATION MODAL */}
      <Modal
        isOpen={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
        title="Upgrade or Change Subscription Plan"
        description="Instant server-calculated credit adjustments"
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-text-2 uppercase block mb-1.5">
              Available Tiers
            </label>
            <select
              value={newPlanId || ''}
              onChange={(e) => handleSelectPlan(Number(e.target.value))}
              className="w-full bg-surface border border-glass-border rounded-input px-3.5 py-2.5 text-xs text-white outline-none"
            >
              {plans
                .filter((p) => p.id !== activeSub?.plan_id)
                .map((p) => (
                  <option key={p.id} value={p.id} className="bg-card">
                    {p.name} ({formatINR(p.calculated_price)} / {p.billing_frequency})
                  </option>
                ))}
            </select>
          </div>

          {prorationPreview && (
            <div className="p-4 rounded-xl bg-surface border border-green-500/30 space-y-2 text-xs">
              <div className="flex justify-between text-text-3">
                <span>Unused credit from {prorationPreview.current_plan_name}:</span>
                <span className="text-text-2 tabular-nums">-{formatINR(prorationPreview.unused_credit)}</span>
              </div>
              <div className="flex justify-between text-text-3">
                <span>Prorated charge for {prorationPreview.new_plan_name}:</span>
                <span className="text-white tabular-nums">+{formatINR(prorationPreview.prorated_charge)}</span>
              </div>
              <div className="flex justify-between text-text-3">
                <span>GST (18% on net charge):</span>
                <span className="text-text-2 tabular-nums">+{formatINR(prorationPreview.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-glass-border">
                <span>Net Due Today:</span>
                <span className="text-neon tabular-nums">{formatINR(prorationPreview.net_due_today)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <GlowButton variant="secondary" onClick={() => setChangePlanOpen(false)}>
              Cancel
            </GlowButton>
            <GlowButton variant="primary" onClick={executeChangePlan}>
              Confirm Upgrade
            </GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
