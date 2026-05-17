'use client';

import * as React from 'react';
import { Drawer as Vaul } from 'vaul';
import { cn } from '@/lib/utils';

export const Sheet = Vaul.Root;
export const SheetTrigger = Vaul.Trigger;
export const SheetClose = Vaul.Close;

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum % of viewport the sheet occupies when open. */
  maxHeight?: 'half' | 'three-quarter' | 'full';
}

export function SheetContent({
  children,
  className,
  maxHeight = 'three-quarter',
  ...props
}: SheetContentProps) {
  const heightClass =
    maxHeight === 'half' ? 'max-h-[50dvh]' :
    maxHeight === 'full' ? 'max-h-[92dvh]' :
    'max-h-[78dvh]';

  return (
    <Vaul.Portal>
      <Vaul.Overlay className="fixed inset-0 z-40 bg-charcoal-900/40 backdrop-blur-sm" />
      <Vaul.Content
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'flex flex-col',
          heightClass,
          'bg-cream-50 rounded-t-3xl',
          'shadow-[var(--shadow-sheet)]',
          'outline-none',
          'pb-[calc(env(safe-area-inset-bottom,0px)+16px)]',
          className,
        )}
        {...props}
      >
        <div className="pt-2 pb-1 flex justify-center shrink-0">
          <div className="w-9 h-1 rounded-full bg-charcoal-200" aria-hidden />
        </div>
        <div className="overflow-y-auto px-5 pt-2 flex-1">{children}</div>
      </Vaul.Content>
    </Vaul.Portal>
  );
}

export function SheetTitle({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Vaul.Title
      className={cn(
        'text-base font-medium tracking-tight text-charcoal-900',
        'mb-1',
        className,
      )}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </Vaul.Title>
  );
}

export function SheetDescription({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Vaul.Description className={cn('text-xs text-charcoal-500 mb-4', className)}>
      {children}
    </Vaul.Description>
  );
}
