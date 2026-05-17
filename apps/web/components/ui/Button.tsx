'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium',
    'rounded-xl whitespace-nowrap',
    'transition-all duration-150 ease-out',
    'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-emerald-500 focus-visible:ring-offset-cream-100',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-emerald-500 text-cream-50 hover:bg-emerald-600 shadow-card',
        secondary:
          'bg-cream-50 text-emerald-500 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-50',
        ghost: 'bg-transparent text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900',
        gold: 'bg-gold-500 text-charcoal-900 hover:bg-gold-300',
        destructive: 'bg-transparent text-danger border border-danger/40 hover:bg-danger/5',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-13 px-5 text-base',
        xl: 'h-14 px-6 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
