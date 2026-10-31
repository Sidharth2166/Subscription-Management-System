import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { GlowButton } from '../components/ui/GlowButton';
import { CssGlassPlatesFallback } from '../components/3d/CssGlassPlatesFallback';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

const taglines = [
  { quote: 'Never miss a renewal.', author: 'Autonomous cycle tracking & alerts' },
  { quote: 'Catch billing errors before customers do.', author: 'Smart Pre-flight Guardian' },
  { quote: 'Ask your revenue data anything.', author: 'Conversational AI Intelligence' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cross-fading tagline every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e?: React.FormEvent, forcedEmail?: string, forcedRole?: UserRole) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const targetEmail = forcedEmail || email;

    if (!targetEmail || (!password && !forcedEmail)) {
      setErrorMessage('Please provide your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 600)); // smooth experience
      await login(targetEmail, forcedRole);
      setIsSuccess(true);

      setTimeout(() => {
        if (targetEmail.includes('customer') || forcedRole === 'customer') {
          navigate('/portal');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch {
      setErrorMessage('Invalid credentials. Please verify your email and password.');
      setIsLoading(false);
    }
  };

  const fillDemo = (role: UserRole) => {
    if (role === 'admin') {
      setEmail('admin@subflow.dev');
      setPassword('SubFlow#2026');
      handleLogin(undefined, 'admin@subflow.dev', 'admin');
    } else if (role === 'staff') {
      setEmail('staff@subflow.dev');
      setPassword('SubFlow#2026');
      handleLogin(undefined, 'staff@subflow.dev', 'staff');
    } else {
      setEmail('customer@subflow.dev');
      setPassword('SubFlow#2026');
      handleLogin(undefined, 'customer@subflow.dev', 'customer');
    }
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-1 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background Aurora */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="grid-floor" />
      </div>
      <div className="film-grain" />

      {/* LEFT 55%: Cinematic Artwork & Rotating Testimonials */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 border-r border-glass-border/60 z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border-strong flex items-center justify-center text-neon shadow-[0_0_18px_rgba(85,255,118,0.3)]">
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
          <span className="font-display font-extrabold text-2xl tracking-tight text-white">
            Sub<span className="neon-text">Flow</span>
          </span>
        </Link>

        {/* Center 3D/CSS Glass Plates Art */}
        <div className="my-auto py-8">
          <CssGlassPlatesFallback />
        </div>

        {/* Bottom Rotating Quotes */}
        <div className="h-24 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={taglineIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-1"
            >
              <p className="text-xl font-bold text-white tracking-tight">
                "{taglines[taglineIndex].quote}"
              </p>
              <p className="text-xs text-neon font-medium">
                — {taglines[taglineIndex].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT 45%: Centered Glass Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[440px] space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-display font-extrabold text-2xl text-white">
                Sub<span className="neon-text">Flow</span>
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 rounded-hero border border-glass-border-strong shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_30px_rgba(85,255,118,0.12)]">
            <div className="space-y-2 mb-6 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h2>
              <p className="text-xs text-text-3">
                Sign in to manage subscriptions, audit billing, and monitor MRR.
              </p>
            </div>

            {/* Judge Demo Login Quick-Fill Chips */}
            <div className="mb-6 p-3 rounded-xl bg-surface/80 border border-glass-border space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neon flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Judge Quick Demo Login</span>
                </span>
                <span className="text-[10px] text-text-3">1-click sign in</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="py-1 px-2 rounded-lg bg-card hover:bg-surface border border-neon/30 hover:border-neon text-[11px] font-semibold text-white transition-all cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('staff')}
                  className="py-1 px-2 rounded-lg bg-card hover:bg-surface border border-glass-border hover:border-neon/50 text-[11px] font-semibold text-text-2 hover:text-white transition-all cursor-pointer"
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('customer')}
                  className="py-1 px-2 rounded-lg bg-card hover:bg-surface border border-glass-border hover:border-neon/50 text-[11px] font-semibold text-text-2 hover:text-white transition-all cursor-pointer"
                >
                  Customer
                </button>
              </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/40 flex items-center gap-2 text-xs text-danger font-medium"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-text-2 hover:text-text-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-glass-border bg-surface accent-[#55FF76] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-text-3 hover:text-neon transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="pt-2">
                <GlowButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isSuccess}
                >
                  {isSuccess ? (
                    <span className="flex items-center gap-1.5 text-black">
                      <Check className="w-4 h-4" />
                      <span>Authenticated</span>
                    </span>
                  ) : (
                    'Sign In to SubFlow'
                  )}
                </GlowButton>
              </div>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center text-xs text-text-3">
              Don't have an account?{' '}
              <Link to="/register" className="text-neon font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
