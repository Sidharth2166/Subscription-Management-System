import { GlowButton } from './GlowButton';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-glass-border rounded-card bg-surface/30 backdrop-blur-sm ${className}`}
    >
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-card border border-glass-border flex items-center justify-center text-neon shadow-[0_0_25px_rgba(85,255,118,0.2)]">
          <Icon className="w-8 h-8" />
        </div>
        <div className="absolute -inset-1 rounded-2xl bg-neon/10 blur-xl pointer-events-none" />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-text-3 max-w-sm mb-6">{description}</p>

      {actionLabel && onAction && (
        <GlowButton variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </GlowButton>
      )}
    </div>
  );
};
