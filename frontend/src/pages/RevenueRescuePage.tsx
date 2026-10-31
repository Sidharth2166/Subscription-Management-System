import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldAlert,
  Clock,
  RefreshCw,
  Send,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { formatINR, formatDateTime } from '../utils/format';
import { api } from '../api/client';

export const RevenueRescuePage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [howWeScoreOpen, setHowWeScoreOpen] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([api.getRescueSummary(), api.getRescueQueue()])
      .then(([sum, q]) => {
        setSummary(sum);
        setQueue(q);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendReminder = async (invoiceId: number) => {
    try {
      const res = await api.sendReminder(invoiceId);
      setReminderStatus(res.message);
      setTimeout(() => setReminderStatus(null), 4000);
    } catch {
      alert('Failed to send reminder');
    }
  };

  const handleInstantRetry = async (invoiceId: number) => {
    try {
      const res = await api.simulateRetrySuccess(invoiceId);
      alert(`Success! Payment recovered: ${formatINR(res.amount_recovered)}`);
      fetchData();
    } catch {
      alert('Retry failed');
    }
  };

  return (
    <div className="space-y-8 text-left select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">AUTONOMOUS RETENTION</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Revenue Rescue Engine
          </h1>
          <p className="text-xs text-text-3">
            Priority-ranked collections queue with orchestrated dunning cadences and failure prevention.
          </p>
        </div>

        <button
          onClick={() => setHowWeScoreOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-glass-border text-xs text-text-2 hover:text-white hover:border-neon/40 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-neon" />
          <span>How we score this</span>
        </button>
      </div>

      {/* Top Glass Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-card border border-glass-border">
          <span className="text-[10px] text-text-3 uppercase font-semibold">Total Outstanding</span>
          <div className="text-xl sm:text-2xl font-extrabold text-warning mt-1 tabular-nums">
            {formatINR(summary?.total_outstanding ?? 68500)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-glass-border">
          <span className="text-[10px] text-text-3 uppercase font-semibold">Overdue Invoices</span>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 tabular-nums">
            {summary?.overdue_count ?? 3}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-glass-border">
          <span className="text-[10px] text-text-3 uppercase font-semibold">Failed Payments</span>
          <div className="text-xl sm:text-2xl font-extrabold text-danger mt-1 tabular-nums">
            {summary?.failed_payments ?? 2}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-glass-border">
          <span className="text-[10px] text-text-3 uppercase font-semibold">Renewing Next 7D</span>
          <div className="text-xl sm:text-2xl font-extrabold text-neon mt-1 tabular-nums">
            {summary?.upcoming_renewals ?? 4}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-b from-card to-green-950/40 border border-green-500/30 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-neon uppercase font-bold">Recovered This Month</span>
          <div className="text-xl sm:text-2xl font-extrabold text-neon mt-1 tabular-nums">
            {formatINR(summary?.recovered_this_month ?? 184000)}
          </div>
        </div>
      </div>

      {/* Alert toast for reminder dispatch */}
      {reminderStatus && (
        <div className="p-3.5 rounded-xl bg-green-500/15 border border-green-500/40 text-xs text-neon flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{reminderStatus}</span>
        </div>
      )}

      {/* PRIORITY RESCUE QUEUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon" />
            <h2 className="text-lg font-bold text-white tracking-tight">Priority Rescue Queue</h2>
          </div>
          <span className="text-xs text-text-3 font-mono">{queue.length} accounts prioritized</span>
        </div>

        {queue.length === 0 ? (
          <GlassCard className="py-12 text-center text-xs text-text-3">
            Zero accounts in dunning. All invoices are settled or within terms!
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {queue.map((item, idx) => (
              <GlassCard
                key={item.invoice_id}
                variant={item.risk_level === 'at_risk' ? 'bottom-glow' : 'spotlight'}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-text-3">#0{idx + 1}</span>
                    <h3 className="text-base font-bold text-white">{item.company_name}</h3>
                    <StatusChip status={item.risk_level} size="sm" />
                    <span className="text-[10px] text-text-3 font-mono">Invoice: {item.invoice_number}</span>
                  </div>

                  <p className="text-xs text-text-2 leading-relaxed">
                    <strong className="text-white">Reason: </strong>{item.reason}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-text-3 pt-1">
                    <span>Overdue: <strong className="text-warning">{item.days_overdue} days</strong></span>
                    <span>Dunning Cadence: <strong className="text-white">Attempt {item.retry_attempt}/{item.max_retries}</strong></span>
                    {item.next_retry_date && (
                      <span className="text-neon">
                        Next Auto-Retry: {formatDateTime(item.next_retry_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-text-3 uppercase block">Amount Exposed</span>
                    <span className="text-2xl font-extrabold text-neon tabular-nums">
                      {formatINR(item.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <GlowButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSendReminder(item.invoice_id)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Send Reminder
                    </GlowButton>
                    <GlowButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleInstantRetry(item.invoice_id)}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Trigger Retry
                    </GlowButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* "How We Score This" Popover Modal */}
      <Modal
        isOpen={howWeScoreOpen}
        onClose={() => setHowWeScoreOpen(false)}
        title="Revenue Rescue Scoring Algorithm"
        description="Deterministic, transparent risk classification rules"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-text-2">
          <div className="p-3.5 rounded-xl bg-surface border border-glass-border space-y-2">
            <div className="flex items-center gap-2">
              <StatusChip status="at_risk" size="sm" />
              <strong className="text-white">At Risk (Immediate Intervention)</strong>
            </div>
            <p className="text-[11px] leading-relaxed">
              Triggered when an invoice exceeds 14 days overdue OR 3 consecutive payment gateway declines occur. Subscriptions are flagged for churn mitigation and staff outreach.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-glass-border space-y-2">
            <div className="flex items-center gap-2">
              <StatusChip status="needs_attention" size="sm" />
              <strong className="text-white">Needs Attention (Active Dunning)</strong>
            </div>
            <p className="text-[11px] leading-relaxed">
              Triggered when an invoice is 5-14 days past due or 1-2 retries have failed. Automated retry intervals follow Fibonacci-derived cadences (+1, +3, +7 days).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-glass-border space-y-2">
            <div className="flex items-center gap-2">
              <StatusChip status="healthy" size="sm" />
              <strong className="text-white">Healthy (Grace Buffer)</strong>
            </div>
            <p className="text-[11px] leading-relaxed">
              Accounts within the 1-4 day grace period before aggressive dunning sequences begin.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <GlowButton variant="secondary" onClick={() => setHowWeScoreOpen(false)}>
              Got it
            </GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
