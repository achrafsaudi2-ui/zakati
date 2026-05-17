import { defineType, defineField } from 'sanity';

export const viewDescription = defineType({
  name: 'viewDescription',
  title: 'View description',
  type: 'document',
  description: 'Text shown to user when they pick a methodology view.',
  fields: [
    defineField({
      name: 'viewKey',
      title: 'View key (must match engine)',
      type: 'string',
      options: { list: [
        { title: 'Strict — snapshot, highest amount (recommended default)', value: 'Strict' },
        { title: 'Moderate — time-weighted average', value: 'Moderate' },
        { title: 'Lenient — haul-strict, lowest amount', value: 'Lenient' },
      ]},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'displayName',
      title: 'Display name (user-facing)',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description (button subtitle)',
      type: 'localizedString',
    }),
    defineField({
      name: 'longDescription',
      title: 'Full description (modal / info panel)',
      type: 'localizedText',
    }),
    defineField({
      name: 'scholarlyBasis',
      title: 'Scholarly basis (citations)',
      type: 'localizedText',
      description: 'E.g. "Aligned with Hanafi position on jewellery; treats each asset\'s haul separately."',
    }),
    defineField({
      name: 'isDefault',
      title: 'Use as default selection?',
      type: 'boolean',
      initialValue: false,
      description: 'Exactly one view should be marked as default.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    select: { title: 'displayName.en', subtitle: 'viewKey', isDefault: 'isDefault' },
    prepare: ({ title, subtitle, isDefault }) => ({
      title: title ?? subtitle,
      subtitle: `${subtitle}${isDefault ? ' • default' : ''}`,
    }),
  },
});
