import { Logo } from '@/components/brand/Logo';

export default function Loading() {
  return (
    <div className="min-h-dvh container-app flex flex-col items-center justify-center">
      <div className="animate-pulse-soft">
        <Logo size={56} />
      </div>
      <p className="text-[11px] text-charcoal-400 mt-4 tracking-wide uppercase">Loading</p>
    </div>
  );
}
