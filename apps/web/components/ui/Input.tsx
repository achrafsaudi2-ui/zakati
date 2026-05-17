'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  trailing?: React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, trailing, error, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const fieldId = id ?? reactId;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={fieldId}
            className="text-[11px] text-charcoal-500 font-normal flex items-center gap-1"
          >
            {label}
            {hint && (
              <span className="text-[10px] text-charcoal-400 font-normal">· {hint}</span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            className={cn(
              'w-full h-11 rounded-xl px-3.5 text-[15px] font-normal',
              'bg-cream-50 border border-cream-200 text-charcoal-900',
              'placeholder:text-charcoal-400 placeholder:font-normal',
              'transition-colors duration-150',
              'focus:outline-none focus:border-emerald-500 focus:bg-cream-50',
              error && 'border-danger focus:border-danger',
              trailing && 'pr-12',
              className,
            )}
            data-numeric={props.inputMode === 'numeric' || props.inputMode === 'decimal'}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 text-sm">
              {trailing}
            </span>
          )}
        </div>
        {error && <p className="text-[11px] text-danger mt-0.5">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
