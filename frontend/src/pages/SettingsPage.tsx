import React, { useState, useEffect } from 'react';
import {
  FastForward,
  Sparkles,
  Percent,
  ShieldCheck,
  Award,
  Keyboard,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { Modal } from '../components/ui/Modal';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [fastForwardResult, setFastForwardResult] = useState<string | null>(null);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  useEffect(() => {
    api.getTaxes().then(setTaxes).catch(() => {});
    api.getDiscounts().then(setDiscounts).catch(() => {});
  }, []);

  const handleFastForward = async () => {
    setIsFastForwarding(true);
    setFastForwardResult(null);
    try {
      const res = await api.fastForwardCycle();
      setFastForwardResult(res.message);
    } catch {
      setFastForwardResult('Fast-forward execution failed');
    } finally {
      setIsFastForwarding(false);
    }
  };

  const badges = [
    {
      title: 'Payment Recovery Master',
      desc: 'Recovered overdue revenue with zero customer churn',
      icon: Award,
      unlocked: true,
      category: 'Dunning',
    },
    {
      title: 'Billing Guardian Sentinel',
      desc: 'Executed 100% pre-flight audits with zero invoice disputes',
      icon: ShieldCheck,
      unlocked: true,
      category: 'Audit',
    },
    {
      title: 'Renewal Champion',
      desc: 'Achieved 98%+ on-time subscription cycle renewal rate',
      icon: Sparkles,
      unlocked: true,
      category: 'Retention',
    },
    {
      title: 'Zero Leakage Unicorn',
      desc: 'Zero duplicate invoices or tax miscalculations for 12 months',
      icon: Award,
      unlocked: true,
      category: 'Compliance',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-left select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-text block mb-1">CONFIGURATION & JUDGE TOOLKIT</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Settings & System Engine
          </h1>
          <p className="text-xs text-text-3">
            Financial tax rules, active discounts, staff quest badges, and demo simulation tools.
          </p>
        </div>

        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-glass-border text-xs text-text-2 hover:text-white hover:border-neon/40 transition-colors cursor-pointer"
        >
          <Keyboard className="w-3.5 h-3.5 text-neon" />
          <span>Shortcuts (?)</span>
        </button>
      </div>

      {/* SECTION 1: DEMO MODE TIME FAST-FORWARD (FOR JUDGES) */}
      <GlassCard variant="bottom-glow" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-neon tracking-widest flex items-center gap-1.5">
              <FastForward className="w-4 h-4 text-neon" />
              <span>JUDGE DEMO CONTROL: TIME WARP</span>
            </span>
            <h3 className="text-xl font-extrabold text-white">Fast-Forward Billing Cycle (+1 Month)</h3>
            <p className="text-xs text-text-3 max-w-xl leading-relaxed">
              Instantly simulates 30 days passing, advances all subscription period dates, and runs the idempotent billing engine to generate new invoices in real-time.
            </p>
          </div>

          <GlowButton
            variant="primary"
            size="md"
            isLoading={isFastForwarding}
            onClick={handleFastForward}
          >
            <FastForward className="w-4 h-4 mr-1.5" />
            Fast-Forward Time
          </GlowButton>
        </div>

        {fastForwardResult && (
          <div className="p-3.5 rounded-xl bg-neon/15 border border-neon/40 text-xs text-neon font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{fastForwardResult}</span>
          </div>
        )}
      </GlassCard>

      {/* SECTION 2: TEAM QUEST ACHIEVEMENT BADGES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-neon" />
          <h2 className="text-lg font-bold text-white tracking-tight">Team Quest Achievements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <GlassCard key={idx} variant="spotlight" className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-green-500/40 flex items-center justify-center text-neon shadow-[0_0_15px_rgba(85,255,118,0.25)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <StatusChip status="healthy" label="Unlocked" size="sm" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{b.title}</h4>
                  <p className="text-[11px] text-text-3 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: TAX RULES & DISCOUNTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taxes */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-glass-border">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configured Tax Rules</h3>
            <span className="text-xs text-neon">Indian GST Compliance</span>
          </div>
          <div className="space-y-2.5">
            {taxes.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-surface/70 border border-glass-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-[10px] text-text-3 font-mono">{t.code}</div>
                </div>
                <span className="font-bold text-neon text-sm">{t.rate}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Discounts */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-glass-border">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Promo Discounts</h3>
            <span className="text-xs text-text-3">Auto-applied at checkout</span>
          </div>
          <div className="space-y-2.5">
            {discounts.map((d) => (
              <div key={d.id} className="p-3 rounded-xl bg-surface/70 border border-glass-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-mono text-neon font-bold">{d.code}</div>
                  <div className="text-[10px] text-text-3">{d.description}</div>
                </div>
                <span className="font-bold text-white text-sm">
                  {d.discount_type === 'percentage' ? `${d.value}%` : `₹${d.value}`}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Shortcuts Modal */}
      <Modal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        title="SubFlow Keyboard Shortcuts"
        description="Navigate like an elite fintech operator"
        maxWidth="sm"
      >
        <div className="space-y-2 text-xs">
          {[
            { key: 'Ctrl + K', desc: 'Open Command Palette' },
            { key: 'Esc', desc: 'Close any active modal or drawer' },
            { key: '?', desc: 'Toggle keyboard shortcuts cheatsheet' },
          ].map((s, idx) => (
            <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-surface border border-glass-border">
              <span className="text-text-2">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-card border border-glass-border font-mono text-[11px] text-neon">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
