import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  formattedValue?: string;
  prefix?: string;
  suffix?: string;
  change?: number; // percentage change e.g. 12.5 or -3.2
  changePeriod?: string; // e.g. "vs last month"
  sparklineData?: number[];
  variant?: 'bottom-glow' | 'default' | 'spotlight';
  icon?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  formattedValue,
  prefix = '',
  suffix = '',
  change,
  changePeriod = 'vs last month',
  sparklineData,
  variant = 'default',
  icon,
  eyebrow,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'number' ? 0 : value
  );

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 1200; // 1.2s count up
    const startTime = performance.now();
    const startVal = 0;
    const endVal = value;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <GlassCard variant={variant} className={`relative overflow-hidden group ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          {eyebrow && <span className="eyebrow-text block mb-1">{eyebrow}</span>}
          <p className="text-xs font-semibold uppercase tracking-wider text-text-2">{label}</p>
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-neon shadow-[0_0_15px_rgba(85,255,118,0.15)] group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight tabular-nums neon-text">
          {formattedValue ?? `${prefix}${displayValue.toLocaleString('en-IN')}${suffix}`}
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {change !== undefined && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-success/15 text-success border border-success/30'
                  : isNegative
                  ? 'bg-danger/15 text-danger border border-danger/30'
                  : 'bg-white/5 text-text-3 border border-white/10'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : isNegative ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-[11px] text-text-3">{changePeriod}</span>
          </div>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-7 flex items-end gap-1">
            {sparklineData.map((d, i) => {
              const max = Math.max(...sparklineData);
              const min = Math.min(...sparklineData);
              const heightPct = max === min ? 50 : Math.round(((d - min) / (max - min)) * 80 + 20);
              return (
                <div
                  key={i}
                  style={{ height: `${heightPct}%` }}
                  className={`w-2 rounded-t-sm transition-all duration-300 ${
                    i === sparklineData.length - 1
                      ? 'bg-neon shadow-[0_0_8px_rgba(85,255,118,0.8)]'
                      : 'bg-green-500/30'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
