import { defineType, defineField } from 'sanity';

export const tooltip = defineType({
  name: 'tooltip',
  title: 'Tooltip',
  type: 'document',
  description: 'Field-level explanations shown as info icons throughout the app.',
  fields: [
    defineField({
      name: 'key',
      title: 'Tooltip key (referenced in code)',
      type: 'string',
      description: 'E.g. "lendo.default_risk", "stock.proxy_explanation", "haul.what_is_it".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'title',
      title: 'Tooltip title',
      type: 'localizedString',
    }),
    defineField({
      name: 'body',
      title: 'Tooltip body',
      type: 'localizedText',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'learnMoreUrl',
      title: 'Optional "Learn more" URL',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'title.en', subtitle: 'key' },
    prepare: ({ title, subtitle }) => ({ title: title ?? subtitle, subtitle }),
  },
});
