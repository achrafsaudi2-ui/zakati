import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combine Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a money amount with locale-aware grouping. */
export function formatMoney(
  amount: number,
  currency: string,
  options: { compact?: boolean; decimals?: number } = {},
): string {
  const decimals = options.decimals ?? (Math.abs(amount) >= 1000 ? 0 : 2);
  if (options.compact && Math.abs(amount) >= 10_000) {
    const formatted = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
    return `${currency} ${formatted}`;
  }
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Convert one currency to another using rate table (base-relative). */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
  base: string,
): number {
  if (from === to) return amount;
  const fromRate = from === base ? 1 : rates[from];
  const toRate = to === base ? 1 : rates[to];
  if (!fromRate || !toRate) throw new Error(`Missing FX rate for ${from} or ${to}`);
  return (amount / fromRate) * toRate;
}

/** Simple lazy ID generator (collision-resistant for client-side). */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
