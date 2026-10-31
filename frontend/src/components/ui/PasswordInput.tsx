import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrengthMeter?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthMeter = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState<string>('');

    const currentVal = (value !== undefined ? String(value) : internalValue) || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const hasMinLength = currentVal.length >= 8;
    const hasUpper = /[A-Z]/.test(currentVal);
    const hasLower = /[a-z]/.test(currentVal);
    const hasSpecialOrNum = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(currentVal);

    const score = [hasMinLength, hasUpper, hasLower, hasSpecialOrNum].filter(Boolean).length;

    let strengthColor = 'bg-text-3';
    let strengthText = 'Too weak';
    if (score === 1) {
      strengthColor = 'bg-danger';
      strengthText = 'Weak';
    } else if (score === 2) {
      strengthColor = 'bg-warning';
      strengthText = 'Fair';
    } else if (score === 3) {
      strengthColor = 'bg-info';
      strengthText = 'Good';
    } else if (score === 4) {
      strengthColor = 'bg-neon';
      strengthText = 'Strong';
    }

    return (
      <div className="w-full space-y-2">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-3 hover:text-text-1 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...props}
        />

        {showStrengthMeter && currentVal.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-3">Password Strength:</span>
              <span className={`font-semibold ${score >= 3 ? 'text-neon' : score === 2 ? 'text-warning' : 'text-danger'}`}>
                {strengthText}
              </span>
            </div>

            {/* 4-segment meter */}
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full rounded-full transition-all duration-300 ${
                    step <= score ? strengthColor : 'bg-surface'
                  }`}
                />
              ))}
            </div>

            {/* Requirements checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-neon' : 'text-text-3'}`}>
                {hasMinLength ? <Check className="w-3 h-3 text-neon" /> : <X className="w-3 h-3" />}
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-neon' : 'text-text-3'}`}>
                {hasUpper ? <Check className="w-3 h-3 text-neon" /> : <X className="w-3 h-3" />}
                <span>Uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-neon' : 'text-text-3'}`}>
                {hasLower ? <Check className="w-3 h-3 text-neon" /> : <X className="w-3 h-3" />}
                <span>Lowercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecialOrNum ? 'text-neon' : 'text-text-3'}`}>
                {hasSpecialOrNum ? <Check className="w-3 h-3 text-neon" /> : <X className="w-3 h-3" />}
                <span>Number or symbol</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
