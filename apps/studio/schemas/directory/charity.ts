import { defineType, defineField } from 'sanity';

export const charity = defineType({
  name: 'charity',
  title: 'Charity',
  type: 'document',
  description: 'Verified charities shown in the in-app directory after results.',
  fields: [
    defineField({
      name: 'name',
      title: 'Charity name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'One-line description',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'longDescription',
      title: 'Detailed description',
      type: 'localizedText',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'donationUrl',
      title: 'Direct donation URL',
      type: 'url',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'website',
      title: 'Charity website',
      type: 'url',
    }),
    defineField({
      name: 'countries',
      title: 'Countries served',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'ISO codes (e.g. "PS", "SD", "GLOBAL").',
    }),
    defineField({
      name: 'categories',
      title: 'Cause categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags', list: [
        'orphans', 'refugees', 'food_aid', 'water', 'medical',
        'education', 'masjid', 'general_zakat', 'gaza', 'sudan', 'yemen',
      ]},
    }),
    defineField({
      name: 'verificationStatus',
      title: 'Verification status',
      type: 'string',
      options: { list: [
        { title: 'Verified by Zakati', value: 'verified' },
        { title: 'Major recognised charity', value: 'recognised' },
        { title: 'Pending review', value: 'pending' },
      ]},
      initialValue: 'pending',
    }),
    defineField({
      name: 'verificationNote',
      title: 'Verification note (internal)',
      type: 'text',
      description: 'How we verified them. Not shown to users.',
    }),
    defineField({
      name: 'zakatEligible',
      title: 'Confirmed zakat-eligible?',
      type: 'boolean',
      initialValue: false,
      description: 'True only if you have confirmed the charity\'s zakat fund accepts zakat (not just sadaqah).',
    }),
    defineField({
      name: 'featured',
      title: 'Featured (show first)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'enabled',
      title: 'Show in directory',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'shortDescription.en', media: 'logo', verified: 'verificationStatus', enabled: 'enabled' },
    prepare: ({ title, subtitle, media, verified, enabled }) => ({
      title: `${title}${enabled ? '' : ' (disabled)'}`,
      subtitle: `${verified} — ${subtitle ?? ''}`,
      media,
    }),
  },
});
