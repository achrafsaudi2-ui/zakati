'use client';

import * as React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// =============================================================================
// AmountInput — numeric, formatted on blur, with optional inline currency
// =============================================================================

interface AmountInputProps {
  label: string;
  hint?: string;
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  currency?: string;
  optional?: boolean;
  placeholder?: string;
  tooltip?: string;
}

export function AmountInput({
  label,
  hint,
  value,
  onChange,
  currency,
  optional,
  placeholder = '0.00',
  tooltip,
}: AmountInputProps) {
  const [display, setDisplay] = React.useState(value !== undefined ? String(value) : '');
  React.useEffect(() => {
    setDisplay(value !== undefined ? String(value) : '');
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-charcoal-500 flex items-center gap-1.5">
        {label}
        {optional && <span className="text-[10px] text-charcoal-400">(optional)</span>}
        {tooltip && (
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-charcoal-400"
            title={tooltip}
          >
            <Info className="w-3 h-3" aria-hidden />
          </span>
        )}
        {hint && <span className="text-[10px] text-charcoal-400">· {hint}</span>}
      </label>
      <div className="relative">
        <input
          inputMode="decimal"
          type="text"
          value={display}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.-]/g, '');
            setDisplay(raw);
            const num = raw === '' ? undefined : parseFloat(raw);
            onChange(Number.isNaN(num) ? undefined : num);
          }}
          onBlur={() => {
            if (value !== undefined) setDisplay(value.toLocaleString('en-US'));
          }}
          onFocus={() => {
            if (value !== undefined) setDisplay(String(value));
          }}
          placeholder={placeholder}
          data-numeric
          className={cn(
            'w-full h-11 rounded-xl px-3.5 text-[15px] font-medium',
            'bg-cream-50 border border-cream-200 text-charcoal-900',
            'transition-colors duration-150',
            'focus:outline-none focus:border-emerald-500',
            currency && 'pl-12',
          )}
        />
        {currency && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-charcoal-500 font-medium uppercase">
            {currency}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// CurrencyPicker — compact dropdown wired to enabled currency list
// =============================================================================

interface CurrencyPickerProps {
  value: string;
  onChange: (code: string) => void;
  options?: string[];
}

const DEFAULT_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'MAD', 'EGP', 'PKR'];

export function CurrencyPicker({
  value,
  onChange,
  options = DEFAULT_CURRENCIES,
}: CurrencyPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-charcoal-500">Currency</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-11 rounded-xl px-3.5 pr-9 text-[15px] font-medium',
            'bg-cream-50 border border-cream-200 text-charcoal-900',
            'appearance-none cursor-pointer',
            'focus:outline-none focus:border-emerald-500',
          )}
        >
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-charcoal-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden
        />
      </div>
    </div>
  );
}

// =============================================================================
// ToggleRow — boolean question with Yes/No as full-width buttons
// =============================================================================

interface ToggleRowProps {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: ToggleRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13px] font-medium text-charcoal-900">{label}</p>
      {hint && <p className="text-[11px] text-charcoal-500 -mt-0.5 leading-relaxed">{hint}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'h-10 rounded-xl text-[13px] font-medium border transition-colors',
            value
              ? 'bg-emerald-500 border-emerald-500 text-cream-50'
              : 'bg-cream-50 border-cream-200 text-charcoal-500 hover:border-emerald-500/40',
          )}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'h-10 rounded-xl text-[13px] font-medium border transition-colors',
            !value
              ? 'bg-charcoal-700 border-charcoal-700 text-cream-50'
              : 'bg-cream-50 border-cream-200 text-charcoal-500 hover:border-charcoal-500/40',
          )}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// KaratInput — combine karat + weight into pure-grams equivalent
// =============================================================================

interface KaratInputProps {
  pureGrams: number | undefined;
  onChange: (grams: number | undefined) => void;
}

const KARAT_PURITY: Record<string, number> = {
  '24k': 1.0,
  '22k': 0.9167,
  '21k': 0.875,
  '18k': 0.75,
  '14k': 0.5833,
};

export function KaratInput({ pureGrams, onChange }: KaratInputProps) {
  const [grossGrams, setGrossGrams] = React.useState<string>('');
  const [karat, setKarat] = React.useState('22k');

  React.useEffect(() => {
    const grossNum = parseFloat(grossGrams);
    if (!Number.isNaN(grossNum)) {
      onChange(grossNum * KARAT_PURITY[karat]);
    } else {
      onChange(undefined);
    }
  }, [grossGrams, karat, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr,90px] gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-charcoal-500">Total weight</label>
          <input
            inputMode="decimal"
            type="text"
            value={grossGrams}
            onChange={(e) => setGrossGrams(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="grams"
            className="w-full h-11 rounded-xl px-3.5 text-[15px] font-medium bg-cream-50 border border-cream-200 text-charcoal-900 focus:outline-none focus:border-emerald-500"
            data-numeric
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-charcoal-500">Purity</label>
          <select
            value={karat}
            onChange={(e) => setKarat(e.target.value)}
            className="w-full h-11 rounded-xl px-3 pr-7 text-[15px] font-medium bg-cream-50 border border-cream-200 text-charcoal-900 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            {Object.keys(KARAT_PURITY).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      {pureGrams !== undefined && pureGrams > 0 && (
        <p className="text-[11px] text-charcoal-500 leading-relaxed">
          Equivalent to{' '}
          <strong className="text-charcoal-900 font-medium" data-numeric>
            {pureGrams.toFixed(2)}g pure gold
          </strong>{' '}
          for zakat valuation.
        </p>
      )}
    </div>
  );
}
