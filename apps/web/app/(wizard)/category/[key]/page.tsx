// Server component — provides the static param list for `output: 'export'`.
// All UI is in CategoryClient.tsx (client component).

import { CategoryClient } from './CategoryClient';

// These are the category keys the user can navigate to. They must match
// the keys used by useZakatStore's enabledCategories list.
const CATEGORY_KEYS = [
  'cash_account',
  'stock',
  'precious_metal',
  'crypto',
  'cash_on_hand',
  'receivable',
  'islamic_deposit',
  'p2p_investment',
  'business',
  'rental_income_cash',
  'pension',
  'other',
] as const;

export function generateStaticParams() {
  return CATEGORY_KEYS.map((key) => ({ key }));
}

// With output: 'export', only the params listed above are pre-rendered.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ key: string }>;
}

export default async function CategoryEntryPage({ params }: PageProps) {
  const { key } = await params;
  return <CategoryClient categoryKey={key} />;
}
