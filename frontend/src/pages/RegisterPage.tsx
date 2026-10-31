import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { GlowButton } from '../components/ui/GlowButton';
import { CssGlassPlatesFallback } from '../components/3d/CssGlassPlatesFallback';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 700));
      await login(email, 'admin');
      navigate('/dashboard');
    } catch {
      setErrorMessage('Registration failed. Please try again.');
      setIsLoading(false);
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

      {/* LEFT 55%: Artwork */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 border-r border-glass-border/60 z-10">
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

        <div className="my-auto py-8">
          <CssGlassPlatesFallback />
        </div>

        <div className="space-y-1">
          <p className="text-xl font-bold text-white tracking-tight">
            "Eliminate billing leakage before your next fiscal quarter."
          </p>
          <p className="text-xs text-neon font-medium">
            — Enterprise Revenue Operations
          </p>
        </div>
      </div>

      {/* RIGHT 45%: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[460px] space-y-6">
          <div className="glass-card p-8 rounded-hero border border-glass-border-strong shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_30px_rgba(85,255,118,0.12)]">
            <div className="space-y-2 mb-6 text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Create an account</h2>
              <p className="text-xs text-text-3">
                Experience zero-leakage subscription intelligence in minutes.
              </p>
            </div>

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

            <form onSubmit={handleRegister} className="space-y-4 text-left">
              <Input
                label="Full Name"
                placeholder="Meenakshi Iyer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Work Email"
                type="email"
                placeholder="meenakshi@innovate.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <PasswordInput
                label="Create Password"
                placeholder="At least 8 chars..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                showStrengthMeter
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="pt-2">
                <GlowButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Create Organization Account
                </GlowButton>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-text-3">
              Already have an account?{' '}
              <Link to="/login" className="text-neon font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
