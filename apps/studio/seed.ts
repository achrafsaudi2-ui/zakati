// =============================================================================
// Seed data — initial content for Zakati on first deploy
// =============================================================================
// Run: cd apps/studio && npx sanity exec ./seed.ts --with-user-token
// =============================================================================

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN!,
  useCdn: false,
});

const seed = [
  // ----- Site copy (singleton) -----
  {
    _id: 'siteCopy',
    _type: 'siteCopy',
    tagline: { en: 'Calculate your zakat with confidence' },
    heroHeadline: { en: 'Your zakat, computed the way scholars compute it.' },
    heroSubheadline: { en: 'Multi-currency. Three methodology views. Nothing leaves your device.' },
    ctaPrimary: { en: 'Calculate my zakat' },
    finalDuaText: { en: 'May Allah accept it from you.' },
    sadaqaJariyaNote: {
      en: 'Zakati is built and offered as sadaqah jariyah. There are no ads, no accounts, no tracking. Your data stays on your device.',
    },
  },

  // ----- View descriptions (Strict highest / Moderate middle / Lenient lowest) -----
  {
    _id: 'view-strict',
    _type: 'viewDescription',
    viewKey: 'Strict',
    displayName: { en: 'Strict' },
    shortDescription: { en: 'Most inclusive. Errs toward paying more — spiritually safer.' },
    longDescription: {
      en: 'Snapshot of all current wealth on the zakat date. Includes new wealth that has joined existing zakatable holdings ("increase joins principal"). Aligned with AAOIFI Sharia Standard No. 35 — the contemporary consensus used by Islamic finance institutions globally. This view produces the highest amount and is the recommended default for users who want to avoid undercounting.',
    },
    scholarlyBasis: {
      en: 'AAOIFI Sharia Standard No. 35; majority position across the four madhabs on increase-joins-principal; Hanafi-leaning on inclusivity of worn jewellery.',
    },
    isDefault: true,
    displayOrder: 1,
  },
  {
    _id: 'view-moderate',
    _type: 'viewDescription',
    viewKey: 'Moderate',
    displayName: { en: 'Moderate' },
    shortDescription: { en: 'Time-weighted average through the haul. Each asset checked.' },
    longDescription: {
      en: 'Uses the time-weighted average balance for fluctuating accounts. Each distinct asset must complete its own lunar year (haul). New investments acquired mid-year are excluded until they complete a full haul. Produces an amount between Strict and Lenient.',
    },
    scholarlyBasis: {
      en: 'Maliki and Shafi\'i positions on haul-per-asset; pragmatic time-weighted average balance approach.',
    },
    isDefault: false,
    displayOrder: 2,
  },
  {
    _id: 'view-lenient',
    _type: 'viewDescription',
    viewKey: 'Lenient',
    displayName: { en: 'Lenient' },
    shortDescription: { en: 'Only haul-completed wealth at lowest balance.' },
    longDescription: {
      en: 'The most restrictive reading of what counts as zakatable — produces the lowest amount. Uses the lowest balance during the haul for fluctuating accounts. Excludes any asset not continuously held for the full lunar year. Worn jewellery still included (Hanafi position on jewellery, but strict on haul completion).',
    },
    scholarlyBasis: {
      en: 'Strict haul-per-asset verification; lowest-balance basis; treats each asset\'s haul independently rather than joining to principal.',
    },
    isDefault: false,
    displayOrder: 3,
  },

  // ----- Nisab fallback -----
  {
    _id: 'nisabFallback',
    _type: 'nisabFallback',
    goldGrams: 87.48,
    silverGrams: 612.36,
    goldPricePerGramUSD: 158.97,
    silverPricePerGramUSD: 2.51,
    preferredMetal: 'silver',
  },

  // ----- Asset categories -----
  ...[
    { key: 'cash_account', en: 'Cash & bank accounts', hint: 'Checking, savings, e-money', icon: 'wallet', order: 1 },
    { key: 'cash_on_hand', en: 'Cash on hand', hint: 'Physical cash you hold', icon: 'banknote', order: 2 },
    { key: 'precious_metal', en: 'Gold, silver & jewellery', hint: 'Including worn jewellery (Hanafi)', icon: 'gem', order: 3 },
    { key: 'stock', en: 'Stocks & ETFs', hint: 'Individual stocks, index funds', icon: 'bar-chart-3', order: 4 },
    { key: 'crypto', en: 'Crypto', hint: 'Bitcoin, stablecoins, tokens', icon: 'bitcoin', order: 5 },
    { key: 'islamic_deposit', en: 'Islamic deposits', hint: 'Murabaha, Sukuk, Wakala', icon: 'piggy-bank', order: 6 },
    { key: 'p2p_investment', en: 'P2P / crowdlending', hint: 'Lendo, Funding Souq, Beehive', icon: 'users', order: 7 },
    { key: 'receivable', en: 'Money owed to you', hint: 'Loans you gave, refunds due', icon: 'hand-coins', order: 8 },
    { key: 'business', en: 'Business assets', hint: 'Inventory, business cash', icon: 'briefcase', order: 9 },
    { key: 'rental_income_cash', en: 'Rental income (retained)', hint: 'Accumulated rent — property excluded', icon: 'home', order: 10 },
    { key: 'pension', en: 'Pensions & retirement', hint: 'Vested portions only', icon: 'shield-check', order: 11 },
    { key: 'other', en: 'Other', hint: 'Anything else', icon: 'more-horizontal', order: 12 },
  ].map(({ key, en, hint, icon, order }) => ({
    _id: `cat-${key}`,
    _type: 'assetCategory',
    categoryKey: key,
    displayName: { en },
    shortHint: { en: hint },
    iconName: icon,
    enabled: true,
    displayOrder: order,
  })),

  // ----- Feature flags -----
  ...[
    ['show_pdf_export', 'Enable PDF report download'],
    ['show_charity_directory', 'Show charity directory after results'],
    ['show_share_buttons', 'Show share buttons on results'],
    ['show_email_optin', 'Show optional email opt-in for reminders'],
    ['maintenance_mode', 'Display maintenance message instead of app'],
    ['show_arabic_locale', 'Enable Arabic language toggle'],
    ['show_french_locale', 'Enable French language toggle'],
  ].map(([key, desc], i) => ({
    _id: `flag-${key}`,
    _type: 'featureFlag',
    flagKey: key,
    description: desc,
    enabled: !['maintenance_mode', 'show_arabic_locale', 'show_french_locale'].includes(key),
    rolloutPercent: 100,
  })),

  // ----- Share templates -----
  {
    _id: 'share-whatsapp',
    _type: 'shareTemplate',
    platform: 'whatsapp',
    message: {
      en: 'I just calculated my zakat with Zakati — free, private, no ads. It supports multiple currencies and explains every step. May benefit you too: {url}',
    },
  },
  {
    _id: 'share-twitter',
    _type: 'shareTemplate',
    platform: 'twitter',
    message: {
      en: 'Calculated my zakat with @zakati — beautifully done, free forever, nothing leaves your device. Built as sadaqah jariyah. {url}',
    },
  },

  // ----- Currencies -----
  ...[
    ['SAR', 'Saudi Riyal', 'ر.س', 1],
    ['USD', 'US Dollar', '$', 2],
    ['EUR', 'Euro', '€', 3],
    ['GBP', 'British Pound', '£', 4],
    ['AED', 'UAE Dirham', 'د.إ', 5],
    ['MAD', 'Moroccan Dirham', 'د.م.', 6],
    ['EGP', 'Egyptian Pound', 'ج.م', 7],
    ['PKR', 'Pakistani Rupee', '₨', 8],
    ['INR', 'Indian Rupee', '₹', 9],
    ['IDR', 'Indonesian Rupiah', 'Rp', 10],
    ['MYR', 'Malaysian Ringgit', 'RM', 11],
    ['TRY', 'Turkish Lira', '₺', 12],
  ].map(([code, name, symbol, order]) => ({
    _id: `currency-${code}`,
    _type: 'currencyConfig',
    code,
    name: { en: name as string },
    symbol,
    enabled: true,
    displayOrder: order,
  })),
];

async function run() {
  console.log(`Seeding ${seed.length} documents…`);
  const tx = client.transaction();
  for (const doc of seed) {
    tx.createOrReplace(doc as any);
  }
  await tx.commit();
  console.log('✓ Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
