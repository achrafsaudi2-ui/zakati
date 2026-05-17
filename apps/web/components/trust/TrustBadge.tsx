import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  text?: string;
  className?: string;
}

export function TrustBadge({ text = 'On-device', className }: TrustBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-normal',
        'px-2 py-1 rounded-full',
        'bg-emerald-500/8 text-charcoal-500',
        className,
      )}
    >
      <Lock className="w-3 h-3 text-emerald-500" strokeWidth={2} aria-hidden />
      {text}
    </span>
  );
}
