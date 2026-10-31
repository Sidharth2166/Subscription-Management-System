import React from 'react';

export type StatusType = 
  | 'active' | 'paid' | 'healthy' | 'confirmed' | 'success'
  | 'pending' | 'needs_attention' | 'warning'
  | 'overdue' | 'at_risk' | 'failed' | 'past_due' | 'danger'
  | 'draft' | 'closed' | 'cancelled' | 'paused' | 'neutral';

interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  className = '',
  size = 'md',
}) => {
  const normalized = status?.toLowerCase().replace(/\s+/g, '_') as StatusType;

  let bgClass = 'bg-white/5 text-text-2 border-white/10';
  let dotClass = 'bg-text-3';
  let pulse = false;

  if (['active', 'paid', 'healthy', 'confirmed', 'success'].includes(normalized)) {
    bgClass = 'bg-green-500/10 text-neon border-green-500/30 shadow-[0_0_12px_rgba(85,255,118,0.15)]';
    dotClass = 'bg-neon';
    pulse = true;
  } else if (['pending', 'needs_attention', 'warning', 'quotation'].includes(normalized)) {
    bgClass = 'bg-warning/10 text-warning border-warning/30 shadow-[0_0_12px_rgba(255,176,32,0.15)]';
    dotClass = 'bg-warning';
    pulse = true;
  } else if (['overdue', 'at_risk', 'failed', 'past_due', 'danger'].includes(normalized)) {
    bgClass = 'bg-danger/10 text-danger border-danger/30 shadow-[0_0_12px_rgba(255,92,92,0.15)]';
    dotClass = 'bg-danger';
    pulse = true;
  } else {
    // draft, closed, cancelled, paused
    bgClass = 'bg-white/5 text-text-3 border-white/10';
    dotClass = 'bg-text-3';
  }

  const displayLabel = label || normalized.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider select-none ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      } ${bgClass} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};
