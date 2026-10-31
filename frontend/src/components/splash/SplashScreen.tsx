import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('subflow_splash_seen');
    if (hasSeenSplash && !forceShow) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      dismiss();
    }, 2400);

    const handleKeyDown = () => dismiss();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceShow, onComplete]);

  const dismiss = () => {
    sessionStorage.setItem('subflow_splash_seen', 'true');
    setIsVisible(false);
    setTimeout(onComplete, 400); // allow dissolve animation to complete
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        onClick={dismiss}
        className="fixed inset-0 z-[9999] bg-[#030504] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      >
        {/* Subtle Orbit Rings Bloom */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1.2, 1.5], opacity: [0, 0.4, 0] }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="orbit-ring w-[500px] h-[500px] border-neon/30 pointer-events-none"
        />

        {/* Center Point of Light to Radial Bloom */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 3.5], opacity: [0, 0.9, 0.35] }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-green-500/40 via-neon/30 to-lime-glow/20 blur-[90px] pointer-events-none"
        />

        {/* Center Brand Mark & Typography */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated SVG Stylised "S" Flow Ribbon */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 filter drop-shadow-[0_0_25px_rgba(85,255,118,0.7)]"
            >
              <defs>
                <linearGradient id="splashLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#55FF76" />
                  <stop offset="100%" stopColor="#12C94B" />
                </linearGradient>
              </defs>

              {/* Upper Ribbon Loop */}
              <motion.path
                d="M 68 22 C 78 22, 82 32, 74 42 L 34 76 C 26 82, 18 78, 18 68 C 18 56, 32 46, 52 38 L 74 29"
                fill="none"
                stroke="url(#splashLogoGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              />

              {/* Lower Counter-Loop Flow */}
              <motion.path
                d="M 32 78 C 22 78, 18 68, 26 58 L 66 24 C 74 18, 82 22, 82 32 C 82 44, 68 54, 48 62 L 26 71"
                fill="none"
                stroke="#B6FF5C"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="4 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1.3, delay: 0.2, ease: 'easeInOut' }}
              />
            </svg>
          </div>

          {/* Wordmark "SubFlow" with letter reveal & light sweep */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative overflow-hidden"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Sub<span className="neon-text">Flow</span>
            </h1>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-3 text-sm font-medium tracking-wide text-text-2"
          >
            Your revenue. <span className="text-neon font-semibold">In flow.</span>
          </motion.p>
        </div>

        {/* Bottom Glowing Progress Line with Spark */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.0, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-green-500 via-neon to-lime-glow relative"
          >
            {/* Travelling spark at tip */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-[2px] shadow-[0_0_12px_#55FF76]" />
          </motion.div>
        </div>

        {/* Skip hint */}
        <div className="absolute bottom-6 text-[11px] text-text-3 font-mono tracking-wider opacity-60">
          PRESS ANY KEY OR CLICK TO SKIP
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
