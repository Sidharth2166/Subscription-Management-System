import React, { useRef, useState } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  magnetic?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  isLoading = false,
  children,
  className = '',
  magnetic = false,
  disabled,
  onClick,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled || isLoading || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    if (magnetic) setOffset({ x: 0, y: 0 });
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5 font-medium',
    md: 'px-6 py-2.5 text-sm gap-2 font-semibold',
    lg: 'px-8 py-3.5 text-base gap-2.5 font-bold',
  };

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles = 'btn-glow-primary text-black flex items-center justify-center';
  } else if (variant === 'secondary') {
    variantStyles = 'bg-card/70 hover:bg-card text-text-1 border border-glass-border hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(85,255,118,0.2)] rounded-pill flex items-center justify-center transition-all duration-300';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-text-2 hover:text-white relative group flex items-center justify-center';
  } else if (variant === 'danger') {
    variantStyles = 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 hover:border-danger/60 rounded-pill flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(255,92,92,0.15)]';
  }

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={magnetic ? { x: offset.x, y: offset.y } : undefined}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles} ${className}`}
      {...props as any}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : null}
      
      <span>{children}</span>

      {showArrow && !isLoading && (
        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}

      {variant === 'ghost' && (
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-neon transition-all duration-300 group-hover:w-full" />
      )}
    </motion.button>
  );
};
