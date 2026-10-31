import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  Pause,
  Play,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { formatINR, formatDate } from '../utils/format';
import { api } from '../api/client';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // Proration / Change Plan Modal
  const [prorationModalOpen, setProrationModalOpen] = useState(false);
  const [targetSubForProration, setTargetSubForProration] = useState<any | null>(null);
  const [newPlanId, setNewPlanId] = useState<number | null>(null);
  const [prorationPreview, setProrationPreview] = useState<any | null>(null);
  const [isProrationLoading, setIsProrationLoading] = useState(false);

  // Health Reason Popover
  const [healthPopoverSub, setHealthPopoverSub] = useState<any | null>(null);

  const fetchSubscriptions = () => {
    setIsLoading(true);
    api.getSubscriptions()
      .then((data) => {
        setSubscriptions(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSubscriptions();
    api.getPlans().then(setPlans).catch(() => {});
  }, []);

  const openDrawer = (sub: any) => {
    setSelectedSub(sub);
    api.getSubscription(sub.id).then(setSelectedSub).catch(() => {});
    // Fetch history
    fetch(`http://127.0.0.1:8000/api/subscriptions/${sub.id}/history`)
      .then((r) => r.json())
      .then(setHistoryItems)
      .catch(() => setHistoryItems([]));
  };

  const openProrationModal = (sub: any) => {
    setTargetSubForProration(sub);
    const availablePlans = plans.filter((p) => p.id !== sub.plan_id);
    const initialNewPlanId = availablePlans.length > 0 ? availablePlans[0].id : null;
    setNewPlanId(initialNewPlanId);
    setProrationModalOpen(true);
    if (initialNewPlanId) {
      loadProrationPreview(sub.id, initialNewPlanId);
    }
  };

  const loadProrationPreview = (subId: number, planId: number) => {
    setIsProrationLoading(true);
    api.getProrationPreview(subId, planId)
      .then((data) => {
        setProrationPreview(data);
        setIsProrationLoading(false);
      })
      .catch(() => setIsProrationLoading(false));
  };

  const handlePlanChange = (newId: number) => {
    setNewPlanId(newId);
    if (targetSubForProration) {
      loadProrationPreview(targetSubForProration.id, newId);
    }
  };

  const executeChangePlan = async () => {
    if (!targetSubForProration || !newPlanId) return;
    try {
      await api.changePlan(targetSubForProration.id, newPlanId);
      alert('Plan upgraded successfully with authoritative proration adjustments!');
      setProrationModalOpen(false);
      fetchSubscriptions();
      if (selectedSub?.id === targetSubForProration.id) {
        openDrawer(targetSubForProration);
      }
    } catch (err: any) {
      alert(err.message || 'Plan change failed');
    }
  };

  const handleStatusToggle = async (subId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    const reason = nextStatus === 'paused' ? 'Paused by customer request' : 'Resumed subscription cycle';
    try {
      await api.updateSubscriptionStatus(subId, nextStatus, reason);
      fetchSubscriptions();
      if (selectedSub?.id === subId) {
        setSelectedSub({ ...selectedSub, status: nextStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'subscription_number',
      header: 'Subscription #',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-mono text-white font-bold text-xs">{item.subscription_number}</span>
          <div className="text-[10px] text-text-3">Started {formatDate(item.start_date)}</div>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (item) => (
        <div>
          <div className="font-semibold text-white text-xs">{item.customer_name}</div>
          <div className="text-[11px] text-text-3">
            Cycle: {formatDate(item.current_period_start)} - {formatDate(item.current_period_end)}
          </div>
        </div>
      ),
    },
    {
      key: 'plan_name',
      header: 'Plan Tier',
      render: (item) => (
        <span className="font-medium text-text-2 text-xs">{item.plan_name}</span>
      ),
    },
    {
      key: 'mrr',
      header: 'Monthly MRR',
      align: 'right',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-neon tabular-nums">{formatINR(item.mrr)}</span>
      ),
    },
    {
      key: 'health_score',
      header: 'Health Score',
      align: 'center',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setHealthPopoverSub(item);
          }}
          className="inline-flex items-center gap-1 cursor-pointer group"
        >
          <StatusChip status={item.health_score} size="sm" />
          <HelpCircle className="w-3 h-3 text-text-3 group-hover:text-neon transition-colors" />
        </button>
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
      header: 'Change Plan',
      align: 'right',
      render: (item) => (
        <GlowButton
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openProrationModal(item);
          }}
        >
          <Sliders className="w-3.5 h-3.5 mr-1" />
          Upgrade / Change
        </GlowButton>
      ),
    },
  ];

  const lifecycleStages = ['draft', 'quotation', 'confirmed', 'active', 'closed'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">RECURRING CONTRACTS</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Subscriptions & Entitlements
          </h1>
          <p className="text-xs text-text-3">
            Deterministic state machines, live proration adjustments, and transparent health scores.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-3">
          <span>Total Active MRR: </span>
          <strong className="text-neon font-bold">
            {formatINR(subscriptions.reduce((sum, s) => sum + (s.status === 'active' ? Number(s.mrr || 0) : 0), 0))}
          </strong>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => openDrawer(item)}
      />

      {/* Subscription Detail Drawer with Lifecycle Stepper */}
      <Drawer
        isOpen={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        title={selectedSub?.subscription_number}
        subtitle={`${selectedSub?.customer_name} • ${selectedSub?.plan_name}`}
        width="xl"
      >
        {selectedSub && (
          <div className="space-y-6">
            {/* Lifecycle Stepper */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-3 uppercase tracking-wider block">
                Lifecycle Progression
              </span>
              <div className="p-4 rounded-xl bg-surface/80 border border-glass-border flex items-center justify-between">
                {lifecycleStages.map((stage, sIdx) => {
                  const currentIdx = lifecycleStages.indexOf(selectedSub.status);
                  const isCompleted = sIdx <= currentIdx;
                  const isCurrent = sIdx === currentIdx;

                  return (
                    <div key={stage} className="flex-1 flex flex-col items-center relative">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                          isCurrent
                            ? 'bg-neon text-black shadow-[0_0_15px_#55FF76]'
                            : isCompleted
                            ? 'bg-green-500/20 text-neon border border-green-500/40'
                            : 'bg-card text-text-3 border border-glass-border'
                        }`}
                      >
                        {sIdx + 1}
                      </div>
                      <span className="text-[10px] text-text-3 uppercase mt-1 capitalize">{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Score Explainer */}
            <div className="p-4 rounded-xl bg-surface border border-glass-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-3">Account Health Score:</span>
                <StatusChip status={selectedSub.health_score} size="sm" />
              </div>
              <p className="text-xs text-text-2 pt-1">{selectedSub.health_reason || 'Invoices settled on schedule.'}</p>
            </div>

            {/* Plan & Cycle Dates */}
            <div className="p-4 rounded-xl bg-surface/60 border border-glass-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-3">Current Plan:</span>
                <span className="text-white font-bold">{selectedSub.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-3">Cycle Start:</span>
                <span className="text-text-2">{formatDate(selectedSub.current_period_start)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-3">Cycle End / Renewal:</span>
                <span className="text-neon font-semibold">{formatDate(selectedSub.current_period_end)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-3">Contracted Monthly MRR:</span>
                <span className="text-neon font-extrabold text-sm">{formatINR(selectedSub.mrr)}</span>
              </div>
            </div>

            {/* Quick Actions (Pause/Resume, Change Plan) */}
            <div className="grid grid-cols-2 gap-3">
              <GlowButton
                variant="secondary"
                size="sm"
                onClick={() => handleStatusToggle(selectedSub.id, selectedSub.status)}
              >
                {selectedSub.status === 'active' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1.5" />
                    Pause Cycle
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Resume Subscription
                  </>
                )}
              </GlowButton>

              <GlowButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedSub(null);
                  openProrationModal(selectedSub);
                }}
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                Change Plan Tier
              </GlowButton>
            </div>

            {/* Status History Audit Trail */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-neon" />
                <span>Status & Plan History</span>
              </h4>
              <div className="space-y-2">
                {historyItems.length === 0 ? (
                  <p className="text-xs text-text-3">No modifications recorded yet.</p>
                ) : (
                  historyItems.map((h: any) => (
                    <div key={h.id} className="p-3 rounded-lg bg-surface/50 border border-glass-border text-xs space-y-1">
                      <div className="flex justify-between text-text-3 text-[10px]">
                        <span>{h.changed_by || 'System'}</span>
                        <span>{formatDate(h.created_at)}</span>
                      </div>
                      <p className="text-text-2">{h.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Change Plan & Proration Preview Modal */}
      <Modal
        isOpen={prorationModalOpen}
        onClose={() => setProrationModalOpen(false)}
        title="Change Subscription Plan Tier"
        description="Real-time server calculated proration preview"
        maxWidth="lg"
      >
        <div className="space-y-5 text-left">
          <div>
            <label className="text-xs font-semibold text-text-2 uppercase block mb-1.5">
              Select New Plan Tier
            </label>
            <select
              value={newPlanId || ''}
              onChange={(e) => handlePlanChange(Number(e.target.value))}
              className="w-full bg-surface border border-glass-border rounded-input px-3.5 py-2.5 text-xs text-white outline-none"
            >
              {plans
                .filter((p) => p.id !== targetSubForProration?.plan_id)
                .map((p) => (
                  <option key={p.id} value={p.id} className="bg-card">
                    {p.name} ({formatINR(p.calculated_price)} / {p.billing_frequency})
                  </option>
                ))}
            </select>
          </div>

          {/* Proration Numbers Breakdown */}
          {prorationPreview && (
            <div className="p-4 rounded-xl bg-surface border border-green-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-glass-border pb-2">
                <span className="text-text-3">Billing Cycle:</span>
                <span className="text-white font-mono">
                  {formatDate(prorationPreview.cycle_start)} to {formatDate(prorationPreview.cycle_end)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-3">Days in Cycle / Remaining:</span>
                <span className="text-white font-semibold">
                  {prorationPreview.days_used} used • {prorationPreview.days_remaining} of {prorationPreview.days_in_cycle} days remaining
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-3">
                <span>Unused Credit from {prorationPreview.current_plan_name}:</span>
                <span className="text-text-2 tabular-nums">-{formatINR(prorationPreview.unused_credit)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-3">
                <span>Prorated Charge for {prorationPreview.new_plan_name}:</span>
                <span className="text-white tabular-nums">+{formatINR(prorationPreview.prorated_charge)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-3">
                <span>GST (18% on net charge):</span>
                <span className="text-text-2 tabular-nums">+{formatINR(prorationPreview.tax_amount)}</span>
              </div>

              {/* Net Due Today */}
              <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                <div>
                  <span className="text-xs uppercase font-bold text-white block">Net Due Today</span>
                  <span className="text-[10px] text-text-3">Generates automated adjustment invoice</span>
                </div>
                <span className="text-2xl font-extrabold text-neon tabular-nums">
                  {formatINR(prorationPreview.net_due_today)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <GlowButton variant="secondary" onClick={() => setProrationModalOpen(false)}>
              Cancel
            </GlowButton>
            <GlowButton variant="primary" onClick={executeChangePlan}>
              Confirm Plan Change
            </GlowButton>
          </div>
        </div>
      </Modal>

      {/* Health Popover Modal */}
      <Modal
        isOpen={Boolean(healthPopoverSub)}
        onClose={() => setHealthPopoverSub(null)}
        title="Subscription Health Score Explainer"
        maxWidth="sm"
      >
        {healthPopoverSub && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <StatusChip status={healthPopoverSub.health_score} />
            </div>
            <h4 className="text-base font-bold text-white">{healthPopoverSub.customer_name}</h4>
            <p className="text-xs text-text-2 leading-relaxed bg-surface p-3.5 rounded-xl border border-glass-border">
              {healthPopoverSub.health_reason || 'All scheduled billing cycles have been collected on time.'}
            </p>
            <div className="text-[11px] text-text-3">
              Scores are derived from transparent ledger rules (days overdue, failed dunning attempts, and chargeback signals).
            </div>
            <GlowButton variant="secondary" className="w-full" onClick={() => setHealthPopoverSub(null)}>
              Dismiss
            </GlowButton>
          </div>
        )}
      </Modal>
    </div>
  );
};
