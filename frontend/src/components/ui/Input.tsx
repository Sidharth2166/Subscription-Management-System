import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
              error ? 'text-danger' : isFocused ? 'text-neon' : 'text-text-2'
            }`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-3">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-surface/80 border rounded-input px-3.5 py-2.5 text-sm text-text-1 placeholder-text-3/60 transition-all duration-300 outline-none backdrop-blur-md ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-danger/60 focus:border-danger focus:ring-1 focus:ring-danger/40 shadow-[0_0_15px_rgba(255,92,92,0.15)]'
                : isFocused
                ? 'border-green-400 focus:ring-1 focus:ring-neon/40 shadow-[0_0_15px_rgba(85,255,118,0.2)]'
                : 'border-glass-border hover:border-glass-border-strong'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-xs text-danger font-medium mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {hint && !error && (
          <p className="text-xs text-text-3">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
