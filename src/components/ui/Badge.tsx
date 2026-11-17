import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'high' | 'medium' | 'low' | 'pending' | 'in_progress' | 'completed' | 'overdue' | 'urgent' | 'warning' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-700',
    high: 'bg-red-50 text-overdue border border-red-200',
    medium: 'bg-amber-50 text-due-soon border border-amber-200',
    low: 'bg-green-50 text-done border border-green-200',
    pending: 'bg-neutral-100 text-neutral-600',
    in_progress: 'bg-blue-50 text-primary border border-blue-200',
    completed: 'bg-green-50 text-done border border-green-200',
    overdue: 'bg-overdue text-white font-semibold',
    urgent: 'bg-amber-500 text-white font-semibold',
    warning: 'bg-primary-50 text-primary border border-blue-200',
    outline: 'border border-neutral-200 text-neutral-600',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
