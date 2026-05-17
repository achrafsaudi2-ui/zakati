import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'recommended' | 'interactive';
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', selected, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl p-4 bg-cream-50 border transition-colors duration-150',
        variant === 'default' && 'border-cream-200',
        variant === 'recommended' && 'border-2 border-gold-500 p-[15px]',
        variant === 'interactive' &&
          'border-cream-200 hover:border-emerald-500/40 cursor-pointer',
        selected && 'border-emerald-500 bg-emerald-50/40',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardBadge({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-medium tracking-wide',
        'bg-gold-500 text-charcoal-900 px-2 py-0.5 rounded-md',
        '-translate-y-[14px] -mt-[6px] relative',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
