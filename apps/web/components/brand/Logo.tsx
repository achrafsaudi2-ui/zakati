import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

/**
 * Zakati logo — serif Z + gold crescent (variation A: wide grounding crescent).
 * Pure SVG, no dependencies. Scales to any size.
 */
export function Logo({ size = 40, className, showWordmark = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label="Zakati logo"
        className="shrink-0"
      >
        <text
          x="100"
          y="142"
          fontSize="150"
          textAnchor="middle"
          fill="var(--color-emerald-500)"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
        >
          Z
        </text>
        <path
          d="M 32 172 Q 100 196 168 172"
          stroke="var(--color-gold-500)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span
          className="font-medium text-emerald-500 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-serif)', fontSize: size * 0.55 }}
        >
          Zakati
        </span>
      )}
    </div>
  );
}
