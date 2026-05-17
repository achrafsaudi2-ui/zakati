import { defineType, defineField } from 'sanity';

export const announcement = defineType({
  name: 'announcement',
  title: 'Announcement banner',
  type: 'document',
  description: 'Optional banner shown at the top of every page.',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Show banner',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'message',
      title: 'Banner message',
      type: 'localizedString',
      hidden: ({ document }) => !document?.enabled,
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      options: { list: ['info', 'warning', 'celebration'] },
      initialValue: 'info',
      hidden: ({ document }) => !document?.enabled,
    }),
    defineField({
      name: 'linkUrl',
      title: 'Optional link URL',
      type: 'url',
      hidden: ({ document }) => !document?.enabled,
    }),
    defineField({
      name: 'linkLabel',
      title: 'Optional link label',
      type: 'localizedString',
      hidden: ({ document }) => !document?.enabled,
    }),
    defineField({
      name: 'expiresAt',
      title: 'Auto-hide after',
      type: 'datetime',
      hidden: ({ document }) => !document?.enabled,
    }),
  ],
  preview: { prepare: () => ({ title: 'Announcement banner' }) },
});
