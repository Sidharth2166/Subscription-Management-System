import React, { useRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'spotlight' | 'bottom-glow' | 'subtle';
  className?: string;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant === 'spotlight' && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mx', `${x}px`);
      cardRef.current.style.setProperty('--my', `${y}px`);
    }
  };

  let baseStyle = 'glass-card p-6 rounded-card transition-all duration-300';

  if (variant === 'spotlight') {
    baseStyle = 'glass-card spotlight-card p-6 rounded-card transition-all duration-300';
  } else if (variant === 'bottom-glow') {
    baseStyle = 'bottom-glow-card p-6 rounded-card transition-all duration-300';
  } else if (variant === 'subtle') {
    baseStyle = 'bg-card/40 border border-glass-border/60 backdrop-blur-md p-6 rounded-card';
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`${baseStyle} ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
