'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { StepProgress } from '@/components/wizard/StepProgress';
import { StickyFooter } from '@/components/wizard/StickyFooter';

const WIZARD_STEPS = [
  { path: '/start',        label: 'Methodology' },
  { path: '/setup',        label: 'Currency & date' },
  { path: '/categories',   label: 'Your assets' },
  { path: '/category',     label: 'Your assets' }, // dynamic prefix
  { path: '/liabilities',  label: 'Liabilities' },
  { path: '/prepaid',      label: 'Prepaid' },
  { path: '/review',       label: 'Review' },
];

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const stepIndex = WIZARD_STEPS.findIndex((s) => pathname.startsWith(s.path));
  const totalSteps = WIZARD_STEPS.length - 1; // category is dup
  const percent = stepIndex === -1 ? 0 : ((stepIndex + 1) / totalSteps) * 100;
  const currentStep = stepIndex === -1 ? null : WIZARD_STEPS[stepIndex];

  return (
    <div className="min-h-dvh flex flex-col surface-app">
      {/* ----- Sticky top header ----- */}
      <header
        className="
          sticky top-0 z-20
          bg-cream-50/95 backdrop-blur-md
          border-b border-cream-200
          pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-3
        "
      >
        <div className="container-app">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-charcoal-500 hover:text-charcoal-900 transition-colors -ml-1"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-[13px]">Back</span>
            </button>
            <Logo size={24} />
            <TrustBadge />
          </div>
          {currentStep && (
            <div className="mt-3">
              <StepProgress percent={percent} label={currentStep.label} />
            </div>
          )}
        </div>
      </header>

      {/* ----- Page content ----- */}
      <main className="flex-1 container-app pt-5 pb-4">{children}</main>

      {/* ----- Sticky bottom calc footer ----- */}
      <StickyFooter />
    </div>
  );
}
