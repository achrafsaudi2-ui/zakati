import { cn } from '@/lib/utils';

interface StepProgressProps {
  /** 0–100 */
  percent: number;
  label?: string;
  className?: string;
}

export function StepProgress({ percent, label, className }: StepProgressProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center text-[11px] text-charcoal-500 mb-1.5">
          <span>{label}</span>
          <span data-numeric>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-[3px] rounded-full bg-emerald-500/12 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
