import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusChip } from '../components/ui/StatusChip';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Tabs } from '../components/ui/Tabs';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ChartCard } from '../components/ui/ChartCard';
import { formatINR } from '../utils/format';
import { Sparkles, Shield, DollarSign, Users, Layers, Zap } from 'lucide-react';

interface SampleCustomer {
  id: string;
  name: string;
  company: string;
  plan: string;
  mrr: number;
  status: string;
}

const sampleData: SampleCustomer[] = [
  { id: '1', name: 'Aarav Patel', company: 'NovaTech India', plan: 'Enterprise Pro', mrr: 125000, status: 'active' },
  { id: '2', name: 'Meenakshi Iyer', company: 'Zenith Labs', plan: 'Scale Up', mrr: 45000, status: 'paid' },
  { id: '3', name: 'Rohan Deshmukh', company: 'CloudOrbit', plan: 'Growth Tier', mrr: 28000, status: 'needs_attention' },
  { id: '4', name: 'Ananya Sharma', company: 'Veloce AI', plan: 'Starter', mrr: 12000, status: 'at_risk' },
  { id: '5', name: 'Vikram Seth', company: 'PulseWorks', plan: 'Enterprise Pro', mrr: 95000, status: 'draft' },
];

export const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [testPassword, setTestPassword] = useState('');

  const columns: Column<SampleCustomer>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-xs text-text-3">{item.company}</div>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', sortable: true },
    {
      key: 'mrr',
      header: 'Monthly MRR',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-neon tabular-nums">
          {formatINR(item.mrr)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Health / Status',
      sortable: true,
      render: (item) => <StatusChip status={item.status} />,
    },
  ];

  const chartData = [
    { date: 'Oct 01', revenue: 420000 },
    { date: 'Oct 05', revenue: 480000 },
    { date: 'Oct 10', revenue: 530000 },
    { date: 'Oct 15', revenue: 610000 },
    { date: 'Oct 20', revenue: 590000 },
    { date: 'Oct 25', revenue: 740000 },
    { date: 'Oct 31', revenue: 890000 },
  ];

  return (
    <div className="min-h-screen bg-bg-0 text-text-1 p-6 md:p-12 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
        <div className="grid-floor" />
      </div>
      <div className="film-grain" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-surface/60 text-xs font-semibold text-neon">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SUBFLOW DESIGN SYSTEM & TOKENS</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Dark Luxury <span className="neon-text">Neon Glass</span>
          </h1>
          <p className="text-text-2 max-w-2xl text-base md:text-lg">
            High-precision design system handcrafted for next-gen revenue intelligence.
            Near-black canvas, electric green light, translucent glass slabs, and volumetric glow.
          </p>
        </div>

        {/* Section 1: Color Tokens */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-neon">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold">1. Color Palette & Lighting</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl border border-glass-border bg-[#030504]">
              <div className="text-xs text-text-3 font-mono">bg-0</div>
              <div className="text-sm font-bold text-white mt-1">#030504</div>
            </div>
            <div className="p-4 rounded-xl border border-glass-border bg-[#101C14]">
              <div className="text-xs text-text-3 font-mono">surface</div>
              <div className="text-sm font-bold text-white mt-1">#101C14</div>
            </div>
            <div className="p-4 rounded-xl border border-glass-border bg-[#122017]">
              <div className="text-xs text-text-3 font-mono">card</div>
              <div className="text-sm font-bold text-white mt-1">#122017</div>
            </div>
            <div className="p-4 rounded-xl border border-glass-border bg-[#12C94B] text-black">
              <div className="text-xs font-mono opacity-80">green-500</div>
              <div className="text-sm font-bold mt-1">#12C94B</div>
            </div>
            <div className="p-4 rounded-xl border border-glass-border bg-[#55FF76] text-black">
              <div className="text-xs font-mono opacity-80">neon</div>
              <div className="text-sm font-bold mt-1">#55FF76</div>
            </div>
            <div className="p-4 rounded-xl border border-glass-border bg-[#B6FF5C] text-black">
              <div className="text-xs font-mono opacity-80">lime-glow</div>
              <div className="text-sm font-bold mt-1">#B6FF5C</div>
            </div>
          </div>
        </section>

        {/* Section 2: Buttons & Actions */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-neon">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold">2. Buttons & Micro-Interactions</h2>
          </div>

          <GlassCard variant="spotlight" className="flex flex-wrap items-center gap-5">
            <GlowButton variant="primary" showArrow magnetic>
              Let's Build What's Next
            </GlowButton>
            <GlowButton variant="secondary">
              Secondary Glass
            </GlowButton>
            <GlowButton variant="ghost">
              Ghost Link Action
            </GlowButton>
            <GlowButton variant="danger">
              Cancel Subscription
            </GlowButton>
            <GlowButton variant="primary" isLoading>
              Processing
            </GlowButton>
          </GlassCard>
        </section>

        {/* Section 3: Metric Cards with Bottom-Glow & Count-Up */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-neon">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold">3. Metric Cards (Count-Up + Bottom Glow)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              eyebrow="MONTHLY RECURRING"
              label="Real-time MRR"
              value={894200}
              formattedValue={formatINR(894200)}
              change={14.8}
              sparklineData={[30, 42, 55, 60, 58, 72, 85]}
              variant="bottom-glow"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <MetricCard
              eyebrow="PORTFOLIO"
              label="Active Subscriptions"
              value={148}
              change={8.2}
              sparklineData={[110, 120, 128, 134, 142, 145, 148]}
              variant="default"
              icon={<Users className="w-5 h-5" />}
            />
            <MetricCard
              eyebrow="CASH INFLOW"
              label="Collected This Month"
              value={745000}
              formattedValue={formatINR(745000)}
              change={12.4}
              sparklineData={[40, 50, 45, 60, 68, 70, 78]}
              variant="default"
              icon={<Shield className="w-5 h-5" />}
            />
            <MetricCard
              eyebrow="REVENUE AT RISK"
              label="Past Due / Overdue"
              value={68500}
              formattedValue={formatINR(68500)}
              change={-5.1}
              sparklineData={[90, 85, 80, 78, 74, 70, 68]}
              variant="default"
              icon={<Sparkles className="w-5 h-5" />}
            />
          </div>
        </section>

        {/* Section 4: Glowing Chart Card */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-neon">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold">4. Glowing Chart Line Card</h2>
          </div>

          <ChartCard data={chartData} />
        </section>

        {/* Section 5: Status Chips & Pills */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">5. Status Chips with Soft Pulse</h2>
          <GlassCard className="flex flex-wrap items-center gap-4">
            <StatusChip status="active" />
            <StatusChip status="paid" />
            <StatusChip status="healthy" />
            <StatusChip status="needs_attention" />
            <StatusChip status="at_risk" />
            <StatusChip status="overdue" />
            <StatusChip status="failed" />
            <StatusChip status="draft" />
            <StatusChip status="closed" />
          </GlassCard>
        </section>

        {/* Section 6: Inputs, Forms & Password Strength */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">6. Form Controls & Password Strength Meter</h2>
          <GlassCard className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Email"
              placeholder="founder@venture.in"
              hint="We will send invoice receipts here."
            />
            <PasswordInput
              label="Master Password"
              placeholder="Create strong password..."
              showStrengthMeter
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
            />
          </GlassCard>
        </section>

        {/* Section 7: Tabs & Data Table */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">7. Interactive Data Table</h2>
            <Tabs
              tabs={[
                { id: 'overview', label: 'All Accounts', badge: 5 },
                { id: 'active', label: 'Active', badge: 2 },
                { id: 'risk', label: 'Needs Rescue', badge: 2 },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <DataTable
            columns={columns}
            data={sampleData}
            keyExtractor={(item) => item.id}
          />
        </section>

        {/* Section 8: Dialogs, Drawers & Empty States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">8. Modals, Drawers & Alerts</h2>
          <GlassCard className="flex flex-wrap items-center gap-4">
            <GlowButton variant="secondary" onClick={() => setModalOpen(true)}>
              Open Smart Guardian Modal
            </GlowButton>
            <GlowButton variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open Customer Details Drawer
            </GlowButton>
            <GlowButton variant="danger" onClick={() => setConfirmOpen(true)}>
              Open Confirm Dialog
            </GlowButton>
          </GlassCard>
        </section>

        {/* Section 9: Empty State */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">9. Empty State Illustration</h2>
          <EmptyState
            title="No past due invoices"
            description="Your revenue flow is healthy! All customer billings have settled on schedule."
            actionLabel="Generate New Quotation"
            onAction={() => alert('Quotation builder triggered')}
          />
        </section>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Smart Billing Guardian"
        description="Pre-flight verification for automated invoice generation"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface border border-green-500/30 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-neon animate-pulse" />
            <span className="text-sm text-text-1">All 7 guardian checks passed with zero discrepancies.</span>
          </div>
          <p className="text-xs text-text-3">
            Prices match product catalogs, tax rules (GST 18%) verified, no duplicate billing periods detected.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <GlowButton variant="secondary" onClick={() => setModalOpen(false)}>
              Close
            </GlowButton>
            <GlowButton variant="primary" onClick={() => setModalOpen(false)}>
              Confirm & Issue Invoice
            </GlowButton>
          </div>
        </div>
      </Modal>

      {/* Demo Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Customer Profile & Intelligence"
        subtitle="NovaTech India — Enterprise Pro"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-glass-border">
            <div className="text-xs text-text-3 uppercase">Total Billed LTV</div>
            <div className="text-2xl font-bold text-neon mt-1">₹14,50,000.00</div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Active Subscriptions</h4>
            <div className="p-3 rounded-lg bg-surface/60 border border-glass-border text-xs flex justify-between">
              <span>Annual Enterprise License</span>
              <StatusChip status="healthy" size="sm" />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Demo Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          alert('Action executed');
          setConfirmOpen(false);
        }}
        title="Cancel Active Subscription?"
        message="This will pause automated renewals and generate an adjustment credit memo for unused days."
        confirmLabel="Yes, Cancel"
        variant="danger"
      />
    </div>
  );
};
