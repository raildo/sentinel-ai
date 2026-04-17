import React from 'react';
import { cn } from '../lib/utils';

export const Card = ({ children, className, variant = 'default', ...props }: any) => {
  const variants = {
    default: 'bg-surface border-border',
    glass: 'bg-surface/40 backdrop-blur-md border-border/50',
    outline: 'bg-transparent border-border',
  };

  return (
    <div 
      className={cn(
        "rounded-xl border p-6 transition-all duration-200",
        variants[variant as keyof typeof variants] || variants.default,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const Badge = ({ 
  children, 
  variant = 'default',
  className 
}: any) => {
  const variants = {
    default: 'bg-text-secondary/10 text-text-secondary border border-text-secondary/20',
    critical: 'bg-danger/10 text-danger border border-danger/20',
    high: 'bg-danger/10 text-danger border border-danger/20',
    medium: 'bg-warning/10 text-warning border border-warning/20',
    low: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-success/10 text-success border border-success/20',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-widest",
      variants[variant as keyof typeof variants] || variants.default,
      className
    )}>
      {children}
    </span>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  className,
  ...props 
}: any) => {
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white shadow-sm',
    secondary: 'bg-surface hover:bg-border/50 text-text-primary border border-border',
    ghost: 'bg-transparent hover:bg-surface text-text-secondary hover:text-text-primary',
    danger: 'bg-danger hover:bg-danger/90 text-white',
  };

  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
        variants[variant as keyof typeof variants] || variants.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
