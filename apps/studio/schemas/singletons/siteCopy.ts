import { defineType, defineField } from 'sanity';

export const siteCopy = defineType({
  name: 'siteCopy',
  title: 'Site copy',
  type: 'document',
  fields: [
    defineField({
      name: 'tagline',
      title: 'Tagline (shown under logo)',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Home page headline',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Home page sub-headline',
      type: 'localizedText',
    }),
    defineField({
      name: 'ctaPrimary',
      title: 'Primary CTA label (e.g. "Calculate my zakat")',
      type: 'localizedString',
    }),
    defineField({
      name: 'finalDuaText',
      title: 'Closing du\'a / blessing shown after result',
      type: 'localizedText',
      description: 'Appears on results screen and PDF report.',
    }),
    defineField({
      name: 'sadaqaJariyaNote',
      title: 'Sadaqah jariyah note (small print)',
      type: 'localizedText',
      description: 'Optional reminder that Zakati is built as ongoing charity.',
    }),
    defineField({
      name: 'footerText',
      title: 'Footer text',
      type: 'localizedText',
    }),
    defineField({
      name: 'aboutPage',
      title: 'About page body',
      type: 'localizedText',
      description: 'Markdown supported. Describes mission, scholarly review, contact.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Site copy' }) },
});
