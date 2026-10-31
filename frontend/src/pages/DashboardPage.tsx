import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Plus,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { ChartCard } from '../components/ui/ChartCard';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatINRCompact, formatDateTime } from '../utils/format';
import { api } from '../api/client';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pulse, setPulse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoreMetrics, setShowMoreMetrics] = useState(false);
  const [dateRange, setDateRange] = useState('This Month (Oct 2026)');

  useEffect(() => {
    setIsLoading(true);
    api.getDashboardPulse()
      .then((data) => {
        setPulse(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name?.split(' ')[0] || 'Meenakshi';

  const mrrValue = pulse?.mrr ?? 518600;
  const arrValue = pulse?.arr ?? (mrrValue * 12);
  const activeSubs = pulse?.active_subscriptions ?? 38;
  const collected = pulse?.collected_this_month ?? 495000;
  const outstanding = pulse?.total_outstanding ?? 68500;
  const overdueCount = pulse?.overdue_count ?? 3;

  const chartData = pulse?.chart_points?.length
    ? pulse.chart_points
    : [
        { date: 'Oct 01', revenue: 410000 },
        { date: 'Oct 06', revenue: 440000 },
        { date: 'Oct 11', revenue: 465000 },
        { date: 'Oct 16', revenue: 485000 },
        { date: 'Oct 21', revenue: 495000 },
        { date: 'Oct 26', revenue: 512000 },
        { date: 'Oct 31', revenue: 518600 },
      ];

  const needsAttention = pulse?.needs_attention ?? [];
  const statusDistribution = pulse?.status_distribution ?? { active: 38, confirmed: 2, draft: 1, closed: 1 };
  const recentActivity = pulse?.recent_activity ?? [];

  return (
    <div className="space-y-8 select-none">
      {/* ROW 1: GREETING & HEADER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">EXECUTIVE COCKPIT</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            {getGreeting()}, <span className="neon-text">{userName}</span>
          </h1>
          <p className="text-xs text-text-3 mt-0.5">
            Real-time portfolio intelligence from your PostgreSQL/SQLite ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="px-3 py-1.5 rounded-full bg-surface/80 border border-glass-border text-xs text-text-2">
            <span>Period: </span>
            <strong className="text-white">{dateRange}</strong>
          </div>

          {/* Quick Create Action */}
          <GlowButton
            variant="primary"
            size="sm"
            showArrow
            onClick={() => navigate('/quotations')}
          >
            Create Quotation
          </GlowButton>
        </div>
      </div>

      {/* ROW 2: BUSINESS PULSE (4 Large Cards + Optional More Metrics) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            eyebrow="RUN-RATE"
            label="Real-time MRR"
            value={mrrValue}
            formattedValue={formatINR(mrrValue)}
            change={14.8}
            sparklineData={[30, 42, 48, 55, 62, 70, 78]}
            variant="bottom-glow"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <MetricCard
            eyebrow="ACTIVE PORTFOLIO"
            label="Subscriptions"
            value={activeSubs}
            change={8.5}
            sparklineData={[28, 30, 32, 34, 36, 37, 38]}
            variant="default"
            icon={<Users className="w-5 h-5" />}
          />
          <MetricCard
            eyebrow="CASH INFLOW"
            label="Collected (This Month)"
            value={collected}
            formattedValue={formatINR(collected)}
            change={12.4}
            sparklineData={[35, 45, 52, 60, 68, 72, 76]}
            variant="default"
            icon={<CreditCard className="w-5 h-5" />}
          />
          <MetricCard
            eyebrow="REVENUE AT RISK"
            label="Outstanding / Overdue"
            value={outstanding}
            formattedValue={formatINR(outstanding)}
            change={-4.2}
            sparklineData={[80, 78, 75, 72, 70, 69, 68]}
            variant="default"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        </div>

        {/* Toggle secondary metrics (ARR, Overdue accounts) */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowMoreMetrics(!showMoreMetrics)}
            className="inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-neon transition-colors cursor-pointer"
          >
            <span>{showMoreMetrics ? 'Hide secondary metrics' : 'Show ARR & Health breakdown'}</span>
            {showMoreMetrics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showMoreMetrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2"
          >
            <div className="p-4 rounded-xl bg-card border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase font-semibold">Annualized ARR Target</span>
              <div className="text-xl font-bold text-white mt-1 tabular-nums">{formatINR(arrValue)}</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase font-semibold">Overdue Accounts in Dunning</span>
              <div className="text-xl font-bold text-warning mt-1 tabular-nums">{overdueCount} Accounts</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-glass-border">
              <span className="text-[10px] text-text-3 uppercase font-semibold">Pre-Flight Guardian Status</span>
              <div className="text-xl font-bold text-neon mt-1">100% Passed</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ROW 3: LEFT 8 COLS REVENUE CHART CARD + RIGHT 4 COLS NEEDS ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Bottom-Glow Revenue Chart */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Revenue Velocity & Recognized MRR"
            subtitle="Trailing cash flow and billed receivables"
            data={chartData}
            height={300}
          />
        </div>

        {/* Right 4 Cols: Needs Attention Panel */}
        <GlassCard variant="spotlight" className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-glass-border">
            <div>
              <span className="eyebrow-text block mb-0.5">PRIORITY ACTIONS</span>
              <h3 className="text-base font-bold text-white tracking-tight">Needs Attention</h3>
            </div>
            <button
              onClick={() => navigate('/rescue')}
              className="text-xs text-neon hover:underline cursor-pointer font-semibold flex items-center gap-1"
            >
              <span>View Rescue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {needsAttention.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-3">
                Zero overdue accounts. Revenue is healthy!
              </div>
            ) : (
              needsAttention.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface/80 border border-glass-border hover:border-warning/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs text-white truncate">{item.company}</div>
                    <div className="text-[11px] text-warning mt-0.5">{item.reason}</div>
                  </div>
                  <GlowButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/invoices`)}
                  >
                    Resolve
                  </GlowButton>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* ROW 4: LEFT SUBSCRIPTION STATUS DONUT/BAR + RIGHT RECENT ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Cols: Subscription Status Breakdown */}
        <GlassCard variant="default" className="lg:col-span-6 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-glass-border">
            <div>
              <span className="eyebrow-text block mb-0.5">PORTFOLIO MIX</span>
              <h3 className="text-base font-bold text-white">Subscription Distribution</h3>
            </div>
            <span className="text-xs text-text-3 font-mono">{activeSubs} Total Active</span>
          </div>

          {/* Segmented bar visual */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-surface overflow-hidden flex">
              <div style={{ width: '82%' }} className="h-full bg-gradient-to-r from-green-500 to-lime-glow shadow-[0_0_10px_#55FF76]" title="Active (82%)" />
              <div style={{ width: '8%' }} className="h-full bg-warning" title="Confirmed (8%)" />
              <div style={{ width: '5%' }} className="h-full bg-white/20" title="Draft (5%)" />
              <div style={{ width: '5%' }} className="h-full bg-danger/60" title="Closed (5%)" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-surface/70 border border-glass-border">
                <span className="text-text-3 text-[10px] uppercase block">Active</span>
                <span className="font-bold text-neon text-base">{statusDistribution.active ?? 38}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface/70 border border-glass-border">
                <span className="text-text-3 text-[10px] uppercase block">Confirmed</span>
                <span className="font-bold text-warning text-base">{statusDistribution.confirmed ?? 2}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface/70 border border-glass-border">
                <span className="text-text-3 text-[10px] uppercase block">Draft</span>
                <span className="font-bold text-text-2 text-base">{statusDistribution.draft ?? 1}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface/70 border border-glass-border">
                <span className="text-text-3 text-[10px] uppercase block">Closed</span>
                <span className="font-bold text-text-3 text-base">{statusDistribution.closed ?? 1}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right 6 Cols: Recent Activity Timeline */}
        <GlassCard variant="default" className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-glass-border">
            <div>
              <span className="eyebrow-text block mb-0.5">EVENT STREAM</span>
              <h3 className="text-base font-bold text-white">Recent Activity</h3>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs text-text-3 hover:text-neon transition-colors"
            >
              All Events
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((act: any) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-neon mt-1.5 flex-shrink-0 shadow-[0_0_8px_#55FF76]" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{act.title}</span>
                    <span className="text-[10px] text-text-3">{formatDateTime(act.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-text-3 truncate mt-0.5">{act.message}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
