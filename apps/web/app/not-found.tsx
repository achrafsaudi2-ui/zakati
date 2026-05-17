import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function NotFound() {
  return (
    <div className="min-h-dvh container-app flex flex-col items-center justify-center text-center py-10">
      <Logo size={56} className="mb-6" />
      <p
        className="text-[64px] font-medium text-gold-500 leading-none mb-3"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        404
      </p>
      <h1
        className="text-[20px] font-medium tracking-tight text-charcoal-900"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        This page doesn&apos;t exist
      </h1>
      <p className="text-[13px] text-charcoal-500 mt-2 max-w-[28ch]">
        Likely an old link or a mistyped URL.
      </p>
      <Link
        href="/"
        className="flex items-center gap-1.5 mt-6 text-[13px] text-emerald-500 font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Take me home
      </Link>
    </div>
  );
}
