import { defineType, defineField } from 'sanity';

export const currencyConfig = defineType({
  name: 'currencyConfig',
  title: 'Currency',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'ISO 4217 code',
      type: 'string',
      description: 'E.g. SAR, USD, EUR, MAD, GBP, AED, EGP, PKR, INR, IDR, MYR, TRY.',
      validation: (r) => r.required().length(3).uppercase(),
    }),
    defineField({ name: 'name', title: 'Display name', type: 'localizedString' }),
    defineField({
      name: 'symbol',
      title: 'Symbol',
      type: 'string',
      description: 'E.g. "ر.س", "$", "€", "د.م.".',
    }),
    defineField({
      name: 'enabled',
      title: 'Available to users?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order in dropdown',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'fallbackRateAgainstUSD',
      title: 'Fallback rate vs USD',
      type: 'number',
      description: 'How many units of this currency equal 1 USD. Used only if Frankfurter API fails.',
    }),
  ],
  preview: {
    select: { code: 'code', name: 'name.en', enabled: 'enabled', order: 'displayOrder' },
    prepare: ({ code, name, enabled, order }) => ({
      title: `${code} — ${name ?? ''}`,
      subtitle: `${enabled ? '✓' : '✗'} • order ${order}`,
    }),
  },
  orderings: [{
    title: 'Display order',
    name: 'displayOrderAsc',
    by: [{ field: 'displayOrder', direction: 'asc' }],
  }],
});
