import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusChip } from '../components/ui/StatusChip';
import { formatINR } from '../utils/format';
import { CssGlassPlatesFallback } from '../components/3d/CssGlassPlatesFallback';

// Lazy load 3D scene
const HeroGlassPlates = lazy(() => import('../components/3d/HeroGlassPlates'));

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [prorationDays, setProrationDays] = useState(18); // out of 30 days

  // Monitor scroll for sticky navbar blur & border
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Proration live calculations:
  // Upgrading from ₹3,000/mo to ₹8,000/mo mid-cycle
  const oldPlanDaily = 3000 / 30;
  const newPlanDaily = 8000 / 30;
  const unusedOldCredit = Math.round((30 - prorationDays) * oldPlanDaily);
  const proratedNewCharge = Math.round((30 - prorationDays) * newPlanDaily);
  const netDueToday = Math.max(0, proratedNewCharge - unusedOldCredit);

  return (
    <div className="min-h-screen bg-bg-0 text-text-1 selection:bg-neon/30 selection:text-white relative overflow-x-hidden">
      {/* Background Aurora & Grid */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
        <div className="grid-floor" />
      </div>
      <div className="film-grain" />

      {/* Sticky Glass Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-0/80 backdrop-blur-xl border-b border-glass-border py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border-strong flex items-center justify-center text-neon shadow-[0_0_18px_rgba(85,255,118,0.3)] group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <path
                  d="M 68 22 C 78 22, 82 32, 74 42 L 34 76 C 26 82, 18 78, 18 68 C 18 56, 32 46, 52 38 L 74 29"
                  fill="none"
                  stroke="#55FF76"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              Sub<span className="neon-text">Flow</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-2">
            <a href="#features" className="hover:text-neon transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-neon transition-colors">How It Works</a>
            <a href="#copilot" className="hover:text-neon transition-colors">AI Copilot</a>
            <Link to="/design" className="hover:text-neon transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neon" />
              <span>Design System</span>
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <Link to="/login">
              <GlowButton variant="ghost" size="sm">
                Sign In
              </GlowButton>
            </Link>
            <Link to="/register">
              <GlowButton variant="primary" size="sm" showArrow>
                Get Started
              </GlowButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-glass-border-strong bg-surface/80 text-xs font-semibold text-neon shadow-[0_0_15px_rgba(85,255,118,0.2)]">
              <span className="w-2 h-2 rounded-full bg-neon animate-ping" />
              <span>NEXT-GEN REVENUE INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display leading-[1.08]">
              Your subscriptions. <br />
              Your revenue. <br />
              <span className="neon-text">Under control.</span>
            </h1>

            <p className="text-text-2 text-base sm:text-lg max-w-xl leading-relaxed">
              Stop revenue leakage with autonomous billing guardians, self-healing dunning workflows,
              and conversational AI intelligence tailored for hyper-growth SaaS.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <GlowButton
                variant="primary"
                size="lg"
                showArrow
                magnetic
                onClick={() => navigate('/register')}
              >
                Start Free Trial
              </GlowButton>
              <GlowButton
                variant="secondary"
                size="lg"
                onClick={() => {
                  const demoEl = document.getElementById('dashboard-preview');
                  demoEl?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Live Demo
              </GlowButton>
            </div>

            {/* Animated Stat Chips */}
            <div className="pt-6 border-t border-glass-border/60 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-glass-border text-xs text-text-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                <span>Zero duplicate invoices</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-glass-border text-xs text-text-2">
                <RefreshCw className="w-3.5 h-3.5 text-neon" />
                <span>Autonomous dunning</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 border border-glass-border text-xs text-text-2">
                <TrendingUp className="w-3.5 h-3.5 text-neon" />
                <span>Real-time MRR</span>
              </div>
            </div>
          </div>

          {/* Right 3D Fanned Glass Plates */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <Suspense fallback={<CssGlassPlatesFallback />}>
              <HeroGlassPlates />
            </Suspense>
          </div>
        </div>
      </section>

      {/* SECTION 2: DASHBOARD PREVIEW MOCKUP */}
      <section id="dashboard-preview" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-14">
          <span className="eyebrow-text block">COMMAND CENTER</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Designed to feel <span className="neon-text">effortless</span>.
          </h2>
          <p className="text-text-2 max-w-2xl mx-auto text-base">
            An executive cockpit connecting subscriptions, automated invoicing, revenue health, and real-time collections.
          </p>
        </div>

        {/* Tilted Glass Mockup Container */}
        <div className="relative mx-auto max-w-5xl" style={{ perspective: '1200px' }}>
          <motion.div
            initial={{ rotateX: 12, y: 30, opacity: 0 }}
            whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="rounded-hero p-2 sm:p-4 bg-gradient-to-b from-white/10 to-transparent border border-glass-border-strong shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_40px_rgba(85,255,118,0.15)] backdrop-blur-2xl overflow-hidden"
          >
            {/* Top Mockup Browser Chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-surface/80 rounded-t-xl mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <div className="px-6 py-1 rounded-full bg-card border border-glass-border text-xs text-text-3 font-mono">
                https://app.subflow.dev/dashboard
              </div>
              <div className="w-12" />
            </div>

            {/* Realistic Dashboard Mockup Grid */}
            <div className="p-4 sm:p-6 space-y-6 bg-bg-1/90 rounded-b-xl">
              {/* Pulse Metric Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <div className="text-[10px] text-text-3 uppercase font-semibold">Real-Time MRR</div>
                  <div className="text-xl sm:text-2xl font-bold text-neon mt-1">₹8,94,200</div>
                  <div className="text-[10px] text-success mt-1">+14.8% vs last month</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <div className="text-[10px] text-text-3 uppercase font-semibold">Active Subscriptions</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">148</div>
                  <div className="text-[10px] text-text-3 mt-1">0 churning</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <div className="text-[10px] text-text-3 uppercase font-semibold">Collected (Oct)</div>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">₹7,45,000</div>
                  <div className="text-[10px] text-success mt-1">98.2% on-time</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-glass-border">
                  <div className="text-[10px] text-text-3 uppercase font-semibold">Overdue / Needs Rescue</div>
                  <div className="text-xl sm:text-2xl font-bold text-warning mt-1">₹68,500</div>
                  <div className="text-[10px] text-warning mt-1">3 accounts in dunning</div>
                </div>
              </div>

              {/* Chart & Attention row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 p-5 rounded-2xl bg-card border border-glass-border relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Revenue Velocity</span>
                    <span className="text-xs text-neon font-semibold">₹1,24,500 run-rate target</span>
                  </div>
                  {/* Glowing Wave Line */}
                  <div className="h-32 w-full flex items-end gap-2 pt-6">
                    {[40, 55, 48, 65, 59, 78, 85, 92, 110, 105, 128, 145].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          style={{ height: `${(h / 150) * 100}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            i === 11
                              ? 'bg-gradient-to-t from-green-500 to-lime-glow shadow-[0_0_15px_rgba(85,255,118,0.9)]'
                              : 'bg-green-500/25 hover:bg-green-500/50'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 p-5 rounded-2xl bg-card border border-glass-border space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Needs Attention</span>
                  <div className="p-2.5 rounded-xl bg-surface/80 border border-warning/30 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-text-1">CloudOrbit Technologies</div>
                      <div className="text-[11px] text-warning">₹28,000 overdue (attempt 2/3)</div>
                    </div>
                    <StatusChip status="needs_attention" size="sm" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface/80 border border-glass-border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-text-1">NovaTech India</div>
                      <div className="text-[11px] text-text-3">Renewal in 4 days</div>
                    </div>
                    <StatusChip status="healthy" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Callout Badges around Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden sm:flex absolute -left-8 top-1/3 p-4 rounded-2xl bg-card/95 border border-neon/40 shadow-[0_0_30px_rgba(85,255,118,0.25)] backdrop-blur-xl items-center gap-3 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-neon">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-3">Smart Billing Guardian</div>
              <div className="text-sm font-bold text-white">7/7 Checks Passed</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="hidden sm:flex absolute -right-8 bottom-1/4 p-4 rounded-2xl bg-card/95 border border-glass-border-strong shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl items-center gap-3 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-neon">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs text-text-3">Revenue Rescued (Oct)</div>
              <div className="text-sm font-bold text-neon">₹1,84,000 Recovered</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: FEATURE BENTO GRID */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16">
          <span className="eyebrow-text block">ENTERPRISE PRECISION</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Six pillars of <span className="neon-text">revenue velocity</span>.
          </h2>
          <p className="text-text-2 max-w-2xl mx-auto text-base">
            Engineered from first principles to eradicate failed collections, manual spreadsheet proration, and invoice disputes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Revenue Rescue (Radar Sweep) */}
          <GlassCard variant="spotlight" className="md:col-span-2 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <span className="eyebrow-text block mb-1">REVENUE RESCUE ENGINE</span>
                <h3 className="text-xl font-bold text-white">Autonomous Payment Recovery</h3>
                <p className="text-xs text-text-3 mt-1 max-w-md">
                  Transparent risk scoring categorizes overdue exposure and triggers orchestrated dunning cadences before accounts churn.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-neon">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            {/* Micro-Animation: Radar Scanner */}
            <div className="mt-8 p-4 rounded-xl bg-surface/50 border border-glass-border relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-semibold mb-3">
                <span className="text-text-2">Rescue Queue Priority</span>
                <span className="text-neon">Scanning 3 accounts</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-card/80 border border-danger/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-danger animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-white">Veloce AI</span>
                      <span className="text-[11px] text-text-3 block">₹12,000 • 5 days overdue</span>
                    </div>
                  </div>
                  <GlowButton variant="secondary" size="sm">
                    Trigger Retry
                  </GlowButton>
                </div>
              </div>
              {/* Radar sweep line */}
              <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-neon/15 to-transparent animate-[pulse_3s_ease-in-out_infinite]" />
            </div>
          </GlassCard>

          {/* Card 2: Smart Billing Guardian */}
          <GlassCard variant="spotlight" className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="eyebrow-text block mb-1">PRE-FLIGHT AUDIT</span>
                <h3 className="text-xl font-bold text-white">Billing Guardian</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-neon">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-text-3 mb-6">
              Runs 7 cryptographic & financial validations before any invoice is confirmed. Never sends incorrect taxes or duplicate periods.
            </p>
            {/* Animated Checklist */}
            <div className="space-y-2.5">
              {[
                'Active billable subscription',
                'No duplicate billing period',
                'Tax & discount rule validity',
                'Totals match line items',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-text-2">
                  <CheckCircle2 className="w-4 h-4 text-neon flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Card 3: Proration Preview Slider */}
          <GlassCard variant="spotlight" className="md:col-span-2 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="eyebrow-text block mb-1">DYNAMIC ADJUSTMENTS</span>
                <h3 className="text-xl font-bold text-white">Live Proration Engine</h3>
                <p className="text-xs text-text-3 mt-1">
                  Drag the cycle slider to test instant credit recalculation when switching tiers mid-month.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-neon">
                <Sliders className="w-5 h-5" />
              </div>
            </div>

            {/* Interactive Proration Slider */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-3">Day of 30-day cycle: <strong className="text-white font-mono">{prorationDays} days elapsed</strong></span>
                <span className="text-text-3">{30 - prorationDays} days remaining</span>
              </div>
              <input
                type="range"
                min="1"
                max="29"
                value={prorationDays}
                onChange={(e) => setProrationDays(Number(e.target.value))}
                className="w-full accent-[#55FF76] cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface/70 border border-glass-border text-center">
                <div>
                  <div className="text-[10px] text-text-3 uppercase">Unused Old Credit</div>
                  <div className="text-sm font-bold text-text-2 tabular-nums">-{formatINR(unusedOldCredit)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-3 uppercase">Prorated New Tier</div>
                  <div className="text-sm font-bold text-white tabular-nums">+{formatINR(proratedNewCharge)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neon uppercase font-semibold">Net Due Today</div>
                  <div className="text-base font-extrabold text-neon tabular-nums">{formatINR(netDueToday)}</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Card 4: AI Business Copilot */}
          <GlassCard variant="spotlight" className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="eyebrow-text block mb-1">CONVERSATIONAL BI</span>
                <h3 className="text-xl font-bold text-white">AI Copilot</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-neon">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-text-3 mb-4">
              Natural language queries over your live subscription database. Safe, parameterized, offline-first.
            </p>
            <div className="p-3 rounded-xl bg-surface border border-glass-border text-xs space-y-2">
              <div className="text-neon font-mono">"Which invoices are past due?"</div>
              <div className="text-text-2 text-[11px] leading-relaxed">
                Found 3 invoices totaling ₹68,500. CloudOrbit has retry scheduled for Nov 2.
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* SECTION 4: PROBLEM VS SUBFLOW (Spreadsheet chaos vs Clean Flow) */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16">
          <span className="eyebrow-text block">THE PARADIGM SHIFT</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Stop firefighting spreadsheets.
          </h2>
          <p className="text-text-2 max-w-2xl mx-auto text-base">
            See how SubFlow transforms brittle billing manual work into a deterministic, self-healing revenue machine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="p-8 rounded-hero border border-danger/20 bg-danger/5 backdrop-blur-md space-y-6">
            <div className="inline-flex items-center gap-2 text-danger font-bold text-sm tracking-wide uppercase">
              <span>Legacy Way: Spreadsheet Chaos</span>
            </div>
            <ul className="space-y-4 text-sm text-text-2">
              <li className="flex items-start gap-3">
                <span className="text-danger font-bold text-base">✕</span>
                <span>Manual invoice generation leads to missed billing cycles and accidental duplicate billings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-danger font-bold text-base">✕</span>
                <span>Failed payments slip through cracks until customers churn silently weeks later.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-danger font-bold text-base">✕</span>
                <span>Proration calculations done on scrap paper with incorrect tax rates and rounding bugs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-danger font-bold text-base">✕</span>
                <span>Zero audit trail of plan modifications, discount overrides, or payment retries.</span>
              </li>
            </ul>
          </div>

          {/* SubFlow Way */}
          <div className="p-8 rounded-hero border border-green-500/40 bg-surface/80 backdrop-blur-md space-y-6 shadow-[0_0_40px_rgba(85,255,118,0.1)]">
            <div className="inline-flex items-center gap-2 text-neon font-bold text-sm tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-neon" />
              <span>The SubFlow Standard: Autonomous Flow</span>
            </div>
            <ul className="space-y-4 text-sm text-text-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon flex-shrink-0" />
                <span>Idempotent billing engine with unique constraints ensures zero duplicate invoices ever.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon flex-shrink-0" />
                <span>Smart Billing Guardian pre-flight checks every line item, tax rule, and discount limit.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon flex-shrink-0" />
                <span>Automated Dunning retries payments per policy (+1, +3, +7 days) with email notifications.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neon flex-shrink-0" />
                <span>Live proration preview calculates exact credit adjustments with full audit logs.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS (13-step Journey) */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16">
          <span className="eyebrow-text block">COMPLETE LIFECYCLE</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            From first quote to <span className="neon-text">perpetual retention</span>.
          </h2>
          <p className="text-text-2 max-w-2xl mx-auto text-base">
            Every transition is logged, audited, and strictly validated in the database.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Register & Onboard', desc: 'Secure role-based setup for admin, staff, or customer' },
            { step: '02', title: 'Create Products & Plans', desc: 'Define billing cadences, variants, and price adjustments' },
            { step: '03', title: 'Issue Quotations', desc: 'Draft interactive quotes with validity and discount previews' },
            { step: '04', title: 'Convert to Subscription', desc: '1-click transition carries line items and schedules cycles' },
            { step: '05', title: 'Guardian Pre-Flight', desc: '7 checks guarantee 100% tax and period correctness' },
            { step: '06', title: 'Auto Generate Invoices', desc: 'Idempotent billing prevents duplicate period charges' },
            { step: '07', title: 'Collect Payments', desc: 'Record partial/full payments via Card, UPI, or Bank' },
            { step: '08', title: 'Simulate Failures', desc: 'Stress test dunning flows with instant test actions' },
            { step: '09', title: 'Revenue Rescue Queue', desc: 'Prioritized risk scoring with 1-click rescue actions' },
            { step: '10', title: 'Prorated Plan Changes', desc: 'Instant server-validated credit and charge preview' },
            { step: '11', title: 'Customer Self-Serve', desc: 'Branded portal for invoices, payments, and plan changes' },
            { step: '12', title: 'AI Copilot Intelligence', desc: 'Natural language queries over your live financial data' },
          ].map((item, idx) => (
            <GlassCard key={idx} variant="default" className="p-5 hover:border-green-400/40 transition-colors">
              <div className="text-xs font-mono text-neon mb-2 font-bold">{item.step} // STAGE</div>
              <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-text-3 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* SECTION 6: BIG NUMBERS (Reference Image 3 style) */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10 border-y border-glass-border/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="eyebrow-text mb-2">DID YOU KNOW?</div>
            <div className="text-5xl sm:text-6xl font-extrabold neon-text">70%</div>
            <p className="text-xs text-text-2 mt-2">faster collections with automated dunning cadences</p>
          </div>
          <div>
            <div className="eyebrow-text mb-2">PROTECTED REVENUE</div>
            <div className="text-5xl sm:text-6xl font-extrabold neon-text">₹1.42 Cr</div>
            <p className="text-xs text-text-2 mt-2">annualized recurring revenue audited and managed</p>
          </div>
          <div>
            <div className="eyebrow-text mb-2">BILLING PRECISION</div>
            <div className="text-5xl sm:text-6xl font-extrabold neon-text">100%</div>
            <p className="text-xs text-text-2 mt-2">zero duplicate invoice tolerance guaranteed</p>
          </div>
          <div>
            <div className="eyebrow-text mb-2">RECOVERY RATE</div>
            <div className="text-5xl sm:text-6xl font-extrabold neon-text">99.4%</div>
            <p className="text-xs text-text-2 mt-2">of failed payment attempts successfully recovered</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: COPILOT SHOWCASE */}
      <section id="copilot" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-14">
          <span className="eyebrow-text block">AI COPILOT</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ask your revenue data <span className="neon-text">anything</span>.
          </h2>
          <p className="text-text-2 max-w-2xl mx-auto text-base">
            No complex dashboards or SQL queries needed. The copilot queries parameterised, permission-safe tools over real tables.
          </p>
        </div>

        <GlassCard variant="bottom-glow" className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-4 border-b border-glass-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface border border-green-500/40 flex items-center justify-center text-neon shadow-[0_0_15px_rgba(85,255,118,0.3)]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">SubFlow Revenue Copilot</h4>
                <p className="text-[11px] text-neon flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                  <span>Online • Connected to live database</span>
                </p>
              </div>
            </div>
            <StatusChip status="healthy" label="Ready" size="sm" />
          </div>

          {/* Interactive Chat Log */}
          <div className="space-y-4 text-xs">
            {/* User message */}
            <div className="flex justify-end">
              <div className="p-3.5 rounded-2xl bg-surface border border-glass-border max-w-md text-text-1">
                "Which customers have repeated payment failures and what is the overdue sum?"
              </div>
            </div>

            {/* AI Assistant response with structured data */}
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-card border border-green-500/30 max-w-lg space-y-3 shadow-[0_0_20px_rgba(85,255,118,0.1)]">
                <p className="text-text-2 leading-relaxed">
                  I analyzed the live ledger. There are <strong>2 customers</strong> with active retry schedules:
                </p>

                <div className="p-2.5 rounded-xl bg-surface/80 border border-glass-border space-y-2">
                  <div className="flex justify-between items-center text-white font-semibold">
                    <span>1. CloudOrbit Technologies</span>
                    <span className="text-danger">₹28,000.00</span>
                  </div>
                  <div className="text-[11px] text-text-3">Attempt 2 of 3 • Next retry: Tomorrow 10:00 AM</div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface/80 border border-glass-border space-y-2">
                  <div className="flex justify-between items-center text-white font-semibold">
                    <span>2. Veloce AI</span>
                    <span className="text-danger">₹12,000.00</span>
                  </div>
                  <div className="text-[11px] text-text-3">Attempt 1 of 3 • Dunning email sent</div>
                </div>

                <p className="text-[11px] text-neon font-semibold">
                  Total exposed risk: ₹40,000.00. Would you like me to trigger an immediate manual retry?
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative z-10 text-center">
        <div className="relative rounded-hero p-10 sm:p-16 bg-gradient-to-b from-card to-surface/90 border border-glass-border-strong shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(85,255,118,0.25)] overflow-hidden">
          {/* Volumetric glow underneath */}
          <div className="absolute -bottom-20 left-1/4 right-1/4 h-40 bg-neon/30 blur-[90px] pointer-events-none" />

          <span className="eyebrow-text block mb-3">TAKE COMMAND</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Ready to put your revenue <span className="neon-text">in flow</span>?
          </h2>
          <p className="text-text-2 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Join modern software founders who eliminate billing friction and protect every rupee of recurring revenue.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <GlowButton
              variant="primary"
              size="lg"
              showArrow
              magnetic
              onClick={() => navigate('/register')}
            >
              Start Free Today
            </GlowButton>
            <GlowButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In to Cockpit
            </GlowButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-glass-border/60 py-12 px-6 max-w-7xl mx-auto text-xs text-text-3 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-white">SubFlow</span>
          <span>© 2026 SubFlow Inc. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/design" className="hover:text-neon transition-colors">Design Tokens</Link>
          <a href="#features" className="hover:text-neon transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-neon transition-colors">Lifecycle</a>
          <Link to="/login" className="hover:text-neon transition-colors">Admin Portal</Link>
        </div>
      </footer>
    </div>
  );
};
