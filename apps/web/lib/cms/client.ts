// =============================================================================
// CMS Client — reads Sanity content and exposes typed config
// =============================================================================
// Cached on the edge. Revalidated every 30s via Sanity webhook + Next.js ISR.
// =============================================================================

import { createClient, type SanityClient } from '@sanity/client';

const sanity: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
});

// -----------------------------------------------------------------------------
// Types — what the app expects to consume
// -----------------------------------------------------------------------------

export interface LocalizedText {
  en: string;
  ar?: string;
  fr?: string;
}

export interface SiteCopy {
  tagline: LocalizedText;
  heroHeadline: LocalizedText;
  heroSubheadline?: LocalizedText;
  ctaPrimary?: LocalizedText;
  finalDuaText?: LocalizedText;
  sadaqaJariyaNote?: LocalizedText;
  footerText?: LocalizedText;
  aboutPage?: LocalizedText;
}

export interface ViewDescription {
  viewKey: 'Strict' | 'Moderate' | 'Lenient';
  displayName: LocalizedText;
  shortDescription?: LocalizedText;
  longDescription?: LocalizedText;
  scholarlyBasis?: LocalizedText;
  isDefault: boolean;
  displayOrder: number;
}

export interface AssetCategory {
  categoryKey: string;
  displayName: LocalizedText;
  shortHint?: LocalizedText;
  iconName?: string;
  enabled: boolean;
  displayOrder: number;
  helpText?: LocalizedText;
  examples?: LocalizedText[];
}

export interface Tooltip {
  key: string;
  title?: LocalizedText;
  body: LocalizedText;
  learnMoreUrl?: string;
}

export interface Charity {
  _id: string;
  name: string;
  shortDescription: LocalizedText;
  longDescription?: LocalizedText;
  logoUrl?: string;
  donationUrl: string;
  website?: string;
  countries?: string[];
  categories?: string[];
  verificationStatus: 'verified' | 'recognised' | 'pending';
  zakatEligible: boolean;
  featured: boolean;
  enabled: boolean;
}

export interface FeatureFlags {
  [key: string]: { enabled: boolean; rolloutPercent: number };
}

export interface NisabFallback {
  goldGrams: number;
  silverGrams: number;
  goldPricePerGramUSD: number;
  silverPricePerGramUSD: number;
  preferredMetal: 'gold' | 'silver';
}

export interface Announcement {
  enabled: boolean;
  message?: LocalizedText;
  tone?: 'info' | 'warning' | 'celebration';
  linkUrl?: string;
  linkLabel?: LocalizedText;
  expiresAt?: string;
}

export interface AppConfig {
  siteCopy: SiteCopy;
  views: ViewDescription[];
  categories: AssetCategory[];
  tooltips: Record<string, Tooltip>;
  charities: Charity[];
  featureFlags: FeatureFlags;
  nisabFallback: NisabFallback;
  announcement: Announcement;
}

// -----------------------------------------------------------------------------
// Fetcher — single GROQ query pulls everything in one round trip
// -----------------------------------------------------------------------------

const APP_CONFIG_QUERY = /* groq */ `{
  "siteCopy": *[_type == "siteCopy"][0],
  "views": *[_type == "viewDescription"] | order(displayOrder asc),
  "categories": *[_type == "assetCategory" && enabled == true] | order(displayOrder asc),
  "tooltips": *[_type == "tooltip"]{key, title, body, learnMoreUrl},
  "charities": *[_type == "charity" && enabled == true] | order(featured desc, name asc) {
    _id, name, shortDescription, longDescription,
    "logoUrl": logo.asset->url,
    donationUrl, website, countries, categories,
    verificationStatus, zakatEligible, featured, enabled
  },
  "featureFlags": *[_type == "featureFlag"]{flagKey, enabled, rolloutPercent},
  "nisabFallback": *[_type == "nisabFallback"][0],
  "announcement": *[_type == "announcement"][0]
}`;

export async function getAppConfig(): Promise<AppConfig> {
  const raw = await sanity.fetch<{
    siteCopy: SiteCopy;
    views: ViewDescription[];
    categories: AssetCategory[];
    tooltips: Array<{ key: string; title?: LocalizedText; body: LocalizedText; learnMoreUrl?: string }>;
    charities: Charity[];
    featureFlags: Array<{ flagKey: string; enabled: boolean; rolloutPercent: number }>;
    nisabFallback: NisabFallback;
    announcement: Announcement;
  }>(APP_CONFIG_QUERY);

  // Shape tooltips into a keyed map for O(1) lookup
  const tooltips: Record<string, Tooltip> = {};
  for (const t of raw.tooltips ?? []) {
    tooltips[t.key] = { key: t.key, title: t.title, body: t.body, learnMoreUrl: t.learnMoreUrl };
  }

  // Shape feature flags into a keyed map
  const featureFlags: FeatureFlags = {};
  for (const f of raw.featureFlags ?? []) {
    featureFlags[f.flagKey] = { enabled: f.enabled, rolloutPercent: f.rolloutPercent };
  }

  return {
    siteCopy: raw.siteCopy,
    views: raw.views ?? [],
    categories: raw.categories ?? [],
    tooltips,
    charities: raw.charities ?? [],
    featureFlags,
    nisabFallback: raw.nisabFallback,
    announcement: raw.announcement ?? { enabled: false },
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function t(field: LocalizedText | undefined, locale: 'en' | 'ar' | 'fr' = 'en'): string {
  if (!field) return '';
  return field[locale] ?? field.en ?? '';
}

export function isFeatureEnabled(flags: FeatureFlags, key: string, userBucket = 100): boolean {
  const flag = flags[key];
  if (!flag) return false;
  if (!flag.enabled) return false;
  return userBucket <= flag.rolloutPercent;
}

// -----------------------------------------------------------------------------
// Charity helpers — used by /charity page
// -----------------------------------------------------------------------------

const projectIdConfigured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

/**
 * Fetch just the charity directory. Falls back to mock list if Sanity isn't
 * configured (e.g. fresh local dev) so the UI is never empty.
 */
export async function fetchCharities(filters?: {
  region?: string;
  cause?: string;
}): Promise<Charity[]> {
  if (!projectIdConfigured) return applyCharityFilters(MOCK_CHARITIES, filters);

  try {
    const all = await sanity.fetch<Charity[]>(/* groq */ `
      *[_type == "charity" && enabled == true] | order(featured desc, name asc) {
        _id, name, shortDescription, longDescription,
        "logoUrl": logo.asset->url,
        donationUrl, website, countries, categories,
        verificationStatus, zakatEligible, featured, enabled
      }
    `);
    return applyCharityFilters(all, filters);
  } catch (err) {
    console.warn('Sanity charity fetch failed, falling back to mocks:', err);
    return applyCharityFilters(MOCK_CHARITIES, filters);
  }
}

function applyCharityFilters(
  list: Charity[],
  filters?: { region?: string; cause?: string },
): Charity[] {
  if (!filters) return list;
  return list.filter((c) => {
    if (filters.region && !(c.countries ?? []).includes(filters.region)) return false;
    if (filters.cause && !(c.categories ?? []).includes(filters.cause)) return false;
    return true;
  });
}

const MOCK_CHARITIES: Charity[] = [
  {
    _id: 'mock-islamic-relief',
    name: 'Islamic Relief',
    shortDescription: {
      en: 'International relief organisation with audited zakat distribution across 40+ countries.',
    },
    donationUrl: 'https://islamic-relief.org/donate/zakat',
    website: 'https://islamic-relief.org',
    countries: ['global'],
    categories: ['general', 'orphans', 'food', 'water'],
    verificationStatus: 'verified',
    zakatEligible: true,
    featured: true,
    enabled: true,
  },
  {
    _id: 'mock-ksrelief',
    name: 'King Salman Humanitarian Aid Centre',
    shortDescription: {
      en: "Saudi Arabia's official humanitarian arm. Direct disbursement to verified beneficiaries.",
    },
    website: 'https://www.ksrelief.org',
    donationUrl: 'https://www.ksrelief.org',
    countries: ['SA', 'middle_east', 'africa', 'asia'],
    categories: ['emergency', 'food', 'medical'],
    verificationStatus: 'recognised',
    zakatEligible: true,
    featured: true,
    enabled: true,
  },
  {
    _id: 'mock-penny-appeal',
    name: 'Penny Appeal',
    shortDescription: {
      en: 'UK-registered charity focused on emergency response, education, and orphan sponsorship.',
    },
    donationUrl: 'https://pennyappeal.org/donate/zakat',
    website: 'https://pennyappeal.org',
    countries: ['UK', 'global', 'middle_east'],
    categories: ['orphans', 'education', 'emergency'],
    verificationStatus: 'verified',
    zakatEligible: true,
    featured: false,
    enabled: true,
  },
  {
    _id: 'mock-zakat-foundation',
    name: 'Zakat Foundation of America',
    shortDescription: {
      en: 'Specialises in zakat collection and disbursement following classical scholarly opinion.',
    },
    donationUrl: 'https://www.zakat.org/donate',
    website: 'https://www.zakat.org',
    countries: ['US', 'global'],
    categories: ['general', 'education', 'food'],
    verificationStatus: 'verified',
    zakatEligible: true,
    featured: false,
    enabled: true,
  },
  {
    _id: 'mock-human-appeal',
    name: 'Human Appeal',
    shortDescription: {
      en: 'International aid agency operating in over 25 countries since 1991.',
    },
    donationUrl: 'https://humanappeal.org.uk/donate/zakat',
    website: 'https://humanappeal.org.uk',
    countries: ['UK', 'global'],
    categories: ['emergency', 'orphans', 'water'],
    verificationStatus: 'verified',
    zakatEligible: true,
    featured: false,
    enabled: true,
  },
  {
    _id: 'mock-muslim-hands',
    name: 'Muslim Hands',
    shortDescription: {
      en: 'Manchester-based international charity. Real-time tracking of zakat disbursement.',
    },
    donationUrl: 'https://muslimhands.org.uk',
    website: 'https://muslimhands.org.uk',
    countries: ['UK', 'global', 'middle_east'],
    categories: ['emergency', 'food', 'education'],
    verificationStatus: 'verified',
    zakatEligible: true,
    featured: false,
    enabled: true,
  },
];
