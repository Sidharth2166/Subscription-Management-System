import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { GlowButton } from '../components/ui/GlowButton';
import { CssGlassPlatesFallback } from '../components/3d/CssGlassPlatesFallback';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-1 flex flex-col lg:flex-row relative overflow-hidden">
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="grid-floor" />
      </div>
      <div className="film-grain" />

      {/* LEFT 55% */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 border-r border-glass-border/60 z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface border border-glass-border-strong flex items-center justify-center text-neon">
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
            "Account protection with zero-trust token issuance."
          </p>
          <p className="text-xs text-neon font-medium">
            — SubFlow Security Architecture
          </p>
        </div>
      </div>

      {/* RIGHT 45% */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[440px]">
          <div className="glass-card p-8 rounded-hero border border-glass-border-strong shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_30px_rgba(85,255,118,0.12)]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-neon mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">Reset Password</h2>
                    <p className="text-xs text-text-3 mt-1.5">
                      Enter your account email. We'll generate a time-limited 30-minute secure reset token.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Account Email"
                      type="email"
                      placeholder="you@company.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                    />

                    <GlowButton
                      type="submit"
                      variant="primary"
                      className="w-full mt-2"
                      isLoading={isLoading}
                    >
                      Send Reset Instructions
                    </GlowButton>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center text-neon mx-auto shadow-[0_0_25px_rgba(85,255,118,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Reset Link Dispatched</h3>
                  <p className="text-xs text-text-2 max-w-xs mx-auto leading-relaxed">
                    A simulated password reset link for <strong className="text-neon">{email}</strong> has been logged to your Notification Centre.
                  </p>
                  <div className="pt-4">
                    <Link to="/login">
                      <GlowButton variant="secondary" size="sm">
                        Return to Sign In
                      </GlowButton>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
