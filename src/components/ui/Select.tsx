import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-neutral-600"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border bg-white text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer',
            error
              ? 'border-overdue focus:border-overdue focus:ring-red-100'
              : 'border-neutral-200 hover:border-neutral-300',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-overdue">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
