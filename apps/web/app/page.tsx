'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col surface-app">
      {/* ----- Header strip ----- */}
      <header className="pt-[calc(env(safe-area-inset-top,0px)+16px)] px-5 pb-2 flex justify-between items-center">
        <Logo size={28} />
        <Link
          href="/settings"
          className="text-[12px] text-charcoal-500 hover:text-charcoal-900 transition-colors"
        >
          Settings
        </Link>
      </header>

      {/* ----- Hero ----- */}
      <section className="container-app flex-1 flex flex-col justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <Logo size={84} className="mb-3" />
          <h1
            className="text-[28px] font-medium leading-[1.05] tracking-tight text-emerald-500"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Zakati
          </h1>
          <p className="text-[13px] text-charcoal-500 mt-1 tracking-wide">زكاتي</p>

          <h2
            className="mt-10 text-[26px] font-medium leading-[1.18] tracking-tight text-charcoal-900 max-w-[16ch]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your zakat, computed the way scholars compute it.
          </h2>

          <p className="mt-4 text-[14px] text-charcoal-500 leading-relaxed max-w-[24ch] mx-auto">
            Multi-currency. Three methodology views. Nothing leaves your device.
          </p>
        </motion.div>

        {/* ----- Trust strip ----- */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-10 flex flex-col gap-2.5 px-2"
        >
          <TrustItem icon={<Lock className="w-4 h-4" />}>
            Every calculation runs in your browser. No accounts, no servers.
          </TrustItem>
          <TrustItem icon={<ShieldCheck className="w-4 h-4" />}>
            Aligned with AAOIFI Standard 35 + four-madhab scholarly review.
          </TrustItem>
          <TrustItem icon={<Sparkles className="w-4 h-4" />}>
            Built and offered as sadaqah jariyah. No ads, ever.
          </TrustItem>
        </motion.ul>
      </section>

      {/* ----- CTA ----- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="container-app pb-[calc(env(safe-area-inset-bottom,0px)+20px)]"
      >
        <Button asChild={false} size="xl" fullWidth className="text-base">
          <Link href="/start" className="contents">
            <span>Calculate my zakat</span>
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </Button>
        <p className="text-center text-[11px] text-charcoal-400 mt-3">
          Takes 4–8 minutes · Auto-saves as you go
        </p>
      </motion.div>
    </main>
  );
}

function TrustItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-[12.5px] text-charcoal-500 leading-relaxed">
      <span className="text-emerald-500 mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
