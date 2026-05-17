import { defineType, defineField } from 'sanity';

export const pdfReportConfig = defineType({
  name: 'pdfReportConfig',
  title: 'PDF report config',
  type: 'document',
  fields: [
    defineField({
      name: 'reportTitle',
      title: 'Report title at top',
      type: 'localizedString',
      initialValue: { en: 'Your Zakat Calculation' },
    }),
    defineField({
      name: 'introParagraph',
      title: 'Intro paragraph (above the totals)',
      type: 'localizedText',
    }),
    defineField({
      name: 'methodologyExplainer',
      title: 'Methodology explainer (below totals)',
      type: 'localizedText',
      description: 'Brief paragraph explaining which view was used and why.',
    }),
    defineField({
      name: 'scholarlyReferences',
      title: 'Scholarly references (printed footer)',
      type: 'array',
      of: [{ type: 'localizedString' }],
      description: 'E.g. "AAOIFI Sharia Standard No. 35", "Hanafi position on jewellery (Ibn Abidin, Radd al-Muhtar)".',
    }),
    defineField({
      name: 'disclaimer',
      title: 'Disclaimer (printed footer)',
      type: 'localizedText',
      initialValue: {
        en: 'Zakati provides estimates only and is not a substitute for personal consultation with a qualified scholar. Verify with your local imam or scholar before paying.',
      },
    }),
    defineField({
      name: 'shareableTagline',
      title: 'Share-friendly tagline on PDF',
      type: 'localizedString',
      initialValue: { en: 'Generated free at zakati.app — built as sadaqah jariyah.' },
    }),
  ],
  preview: { prepare: () => ({ title: 'PDF report config' }) },
});
