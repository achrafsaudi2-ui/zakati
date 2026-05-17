import { defineType, defineField } from 'sanity';

export const nisabFallback = defineType({
  name: 'nisabFallback',
  title: 'Nisab fallback values',
  type: 'document',
  description: 'Used only if the live metals.dev API fails. Update during Ramadan or whenever spot prices shift materially.',
  fields: [
    defineField({
      name: 'goldGrams',
      title: 'Gold nisab (grams)',
      type: 'number',
      initialValue: 87.48,
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'silverGrams',
      title: 'Silver nisab (grams)',
      type: 'number',
      initialValue: 612.36,
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'goldPricePerGramUSD',
      title: 'Gold price per gram (USD) — fallback',
      type: 'number',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'silverPricePerGramUSD',
      title: 'Silver price per gram (USD) — fallback',
      type: 'number',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'preferredMetal',
      title: 'Default nisab metal',
      type: 'string',
      options: { list: [
        { title: 'Silver (more inclusive — captures more wealth as zakatable)', value: 'silver' },
        { title: 'Gold', value: 'gold' },
      ]},
      initialValue: 'silver',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated (manual)',
      type: 'datetime',
    }),
    defineField({
      name: 'updatedBy',
      title: 'Updated by (note)',
      type: 'string',
    }),
  ],
  preview: { prepare: () => ({ title: 'Nisab fallback' }) },
});
