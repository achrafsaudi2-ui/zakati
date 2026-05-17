'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Trash2, Heart, Github, ExternalLink, Sparkles, Lock } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/Sheet';
import { useZakatStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { View } from '@zakati/engine';

const VIEWS: { key: View; name: string; hint: string }[] = [
  { key: 'Strict', name: 'Strict', hint: 'Most inclusive · recommended' },
  { key: 'Moderate', name: 'Moderate', hint: 'Time-weighted average' },
  { key: 'Lenient', name: 'Lenient', hint: 'Haul-strict · lowest' },
];

const CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'MAD', 'EGP', 'PKR'];

export default function SettingsPage() {
  const router = useRouter();
  const view = useZakatStore((s) => s.view);
  const setView = useZakatStore((s) => s.setView);
  const primaryCurrency = useZakatStore((s) => s.primaryCurrency);
  const setPrimaryCurrency = useZakatStore((s) => s.setPrimaryCurrency);
  const zakatDate = useZakatStore((s) => s.zakatDate);
  const setZakatDate = useZakatStore((s) => s.setZakatDate);
  const reset = useZakatStore((s) => s.reset);
  const assets = useZakatStore((s) => s.assets);
  const liabilities = useZakatStore((s) => s.liabilities);

  const [resetOpen, setResetOpen] = useState(false);
  const hasData = assets.length > 0 || liabilities.length > 0;

  const handleReset = () => {
    reset();
    setResetOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-dvh flex flex-col surface-app">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur-md border-b border-cream-200 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-3">
        <div className="container-app flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-charcoal-500 hover:text-charcoal-900 transition-colors -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[13px]">Back</span>
          </button>
          <Logo size={24} />
          <TrustBadge />
        </div>
      </header>

      <main className="flex-1 container-app pt-5 pb-8">
        <h1
          className="text-[22px] font-medium tracking-tight text-charcoal-900 leading-tight mb-5"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Settings
        </h1>

        {/* Calculation preferences */}
        <SettingSection title="Calculation">
          <SettingRow label="Methodology view">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as View)}
              className="bg-transparent text-[14px] text-charcoal-900 font-medium border-none focus:outline-none cursor-pointer text-right"
            >
              {VIEWS.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.name}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label="Primary currency">
            <select
              value={primaryCurrency}
              onChange={(e) => setPrimaryCurrency(e.target.value)}
              className="bg-transparent text-[14px] text-charcoal-900 font-medium border-none focus:outline-none cursor-pointer text-right"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label="Zakat date">
            <input
              type="date"
              value={zakatDate}
              onChange={(e) => setZakatDate(e.target.value)}
              className="bg-transparent text-[14px] text-charcoal-900 font-medium border-none focus:outline-none cursor-pointer text-right"
            />
          </SettingRow>
        </SettingSection>

        {/* Privacy */}
        <SettingSection title="Privacy & data">
          <div className="rounded-2xl bg-cream-50 border border-cream-200 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-charcoal-900">Your data stays here</p>
              <p className="text-[11px] text-charcoal-500 mt-1 leading-relaxed">
                Everything you enter is stored in this browser only. No accounts, no sync, no
                analytics. Clearing your browser data clears this app.
              </p>
            </div>
          </div>

          <button
            onClick={() => setResetOpen(true)}
            disabled={!hasData}
            className={cn(
              'mt-2 w-full flex items-center justify-center gap-2 h-11 rounded-xl border text-[13px] font-medium transition-colors',
              hasData
                ? 'border-danger/40 text-danger hover:bg-danger/5'
                : 'border-cream-200 text-charcoal-400 cursor-not-allowed',
            )}
          >
            <Trash2 className="w-4 h-4" />
            Reset all data
          </button>
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Logo size={32} />
              <div>
                <p className="text-[13px] font-medium text-charcoal-900">Zakati</p>
                <p className="text-[10.5px] text-charcoal-500">Version 0.1.0 · Beta</p>
              </div>
            </div>
            <p className="text-[11.5px] text-charcoal-500 leading-relaxed mb-3">
              Built as <em>sadaqah jariyah</em> — a continuous charity. May Allah accept it from
              the team and from everyone who uses it. No ads, no tracking, no monetization, ever.
            </p>
            <div className="flex flex-col gap-1.5">
              <ExternalRow href="/methodology" label="Methodology & scholarly references" />
              <ExternalRow href="https://github.com" label="Source code" icon={<Github className="w-3 h-3" />} />
              <ExternalRow href="mailto:hello@zakati.app" label="Get in touch" />
            </div>
          </Card>
        </SettingSection>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-charcoal-400 italic flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-500" />
            Jazak Allahu khair for using Zakati.
          </p>
          <Link
            href="/"
            className="text-[12px] text-emerald-500 font-medium mt-3 inline-flex items-center gap-1"
          >
            <Heart className="w-3 h-3" />
            Back to home
          </Link>
        </div>
      </main>

      {/* Reset confirmation */}
      <Sheet open={resetOpen} onOpenChange={setResetOpen}>
        <SheetContent maxHeight="half">
          <SheetTitle>Reset all data?</SheetTitle>
          <SheetDescription>
            This permanently clears your assets, liabilities, prepayments, and preferences. You
            can&apos;t undo this.
          </SheetDescription>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="ghost" size="lg" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="lg" onClick={handleReset}>
              <Trash2 className="w-4 h-4" />
              Reset everything
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <p className="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium px-1 mb-2">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex justify-between items-center py-3">
      <span className="text-[13px] text-charcoal-900">{label}</span>
      {children}
    </Card>
  );
}

function ExternalRow({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="flex items-center justify-between py-1.5 text-[12px] text-emerald-500 font-medium hover:text-emerald-600 transition-colors"
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <ExternalLink className="w-3 h-3 opacity-60" />
    </a>
  );
}
