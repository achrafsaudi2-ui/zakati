'use client';

import Image from 'next/image';
import { ExternalLink, ShieldCheck, Award, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Charity } from '@/lib/cms/client';

interface CharityCardProps {
  charity: Charity;
  locale?: 'en' | 'ar' | 'fr';
}

export function CharityCard({ charity, locale = 'en' }: CharityCardProps) {
  const description =
    charity.shortDescription[locale] ?? charity.shortDescription.en ?? '';
  const href = charity.donationUrl || charity.website || '#';

  return (
    <Card variant={charity.featured ? 'recommended' : 'default'} className="overflow-hidden">
      <div className="flex items-start gap-3">
        {/* Logo or fallback monogram */}
        <div className="w-12 h-12 rounded-xl bg-cream-100 border border-cream-200 flex items-center justify-center shrink-0 overflow-hidden">
          {charity.logoUrl ? (
            <Image
              src={charity.logoUrl}
              alt={charity.name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <span
              className="text-[18px] font-medium text-emerald-500"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {charity.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[14px] font-medium text-charcoal-900 truncate">
              {charity.name}
            </h3>
            {charity.verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700">
                <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                Zakat-verified
              </span>
            )}
            {charity.verificationStatus === 'recognised' && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-gold-500/15 text-gold-700">
                <Award className="w-2.5 h-2.5" strokeWidth={2.5} />
                Officially recognised
              </span>
            )}
          </div>

          <p className="text-[11.5px] text-charcoal-500 mt-1 leading-relaxed line-clamp-3">
            {description}
          </p>

          {/* Categories */}
          {charity.categories && charity.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {charity.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-[9.5px] uppercase tracking-wider text-charcoal-400 bg-cream-100 px-1.5 py-0.5 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex items-center gap-2 mt-3">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center gap-1.5 flex-1 h-9 rounded-lg',
                'bg-emerald-500 text-cream-50 text-[12px] font-medium',
                'hover:bg-emerald-600 transition-colors',
              )}
            >
              <Heart className="w-3.5 h-3.5" />
              Donate
              <ExternalLink className="w-3 h-3" />
            </a>
            {charity.website && charity.website !== href && (
              <a
                href={charity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-charcoal-500 hover:text-charcoal-900 transition-colors px-2"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
