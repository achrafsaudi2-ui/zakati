import { defineType, defineField } from 'sanity';

export const assetCategory = defineType({
  name: 'assetCategory',
  title: 'Asset category',
  type: 'document',
  description: 'The 12 zakatable asset categories shown on the filter screen.',
  fields: [
    defineField({
      name: 'categoryKey',
      title: 'Category key (matches engine asset.kind)',
      type: 'string',
      options: { list: [
        { title: 'Cash & bank accounts', value: 'cash_account' },
        { title: 'Cash on hand', value: 'cash_on_hand' },
        { title: 'Gold, silver & jewellery', value: 'precious_metal' },
        { title: 'Stocks & ETFs', value: 'stock' },
        { title: 'Crypto', value: 'crypto' },
        { title: 'Islamic deposits (Murabaha / Sukuk)', value: 'islamic_deposit' },
        { title: 'P2P / crowdlending', value: 'p2p_investment' },
        { title: 'Money owed to you (receivables)', value: 'receivable' },
        { title: 'Business assets', value: 'business' },
        { title: 'Rental income (retained cash)', value: 'rental_income_cash' },
        { title: 'Pensions & retirement', value: 'pension' },
        { title: 'Other / miscellaneous', value: 'other' },
      ]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'displayName',
      title: 'Display name',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'shortHint',
      title: 'Short hint (under category title)',
      type: 'localizedString',
    }),
    defineField({
      name: 'iconName',
      title: 'Lucide icon name',
      type: 'string',
      description: 'E.g. "wallet", "coins", "bar-chart-3". See lucide.dev/icons.',
    }),
    defineField({
      name: 'enabled',
      title: 'Show in v1?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'helpText',
      title: 'Full help text (modal)',
      type: 'localizedText',
      description: 'Detailed "what counts" / "what does not count" explanation.',
    }),
    defineField({
      name: 'examples',
      title: 'Examples (bulleted list)',
      type: 'array',
      of: [{ type: 'localizedString' }],
    }),
  ],
  preview: {
    select: { title: 'displayName.en', subtitle: 'categoryKey', enabled: 'enabled', order: 'displayOrder' },
    prepare: ({ title, subtitle, enabled, order }) => ({
      title: `${order ?? '?'}. ${title ?? subtitle}`,
      subtitle: `${subtitle}${enabled ? '' : ' • disabled'}`,
    }),
  },
  orderings: [{
    title: 'Display order',
    name: 'displayOrderAsc',
    by: [{ field: 'displayOrder', direction: 'asc' }],
  }],
});
