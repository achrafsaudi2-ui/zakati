import { defineType, defineField } from 'sanity';

export const shareTemplate = defineType({
  name: 'shareTemplate',
  title: 'Share template',
  type: 'document',
  description: 'Template messages for sharing the app. Use {url} as placeholder.',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: ['whatsapp', 'twitter', 'linkedin', 'telegram', 'sms', 'email'] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message body',
      type: 'localizedText',
      description: 'Use {url} as placeholder for the link.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subject',
      title: 'Subject (email only)',
      type: 'localizedString',
      hidden: ({ document }) => document?.platform !== 'email',
    }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'message.en' },
    prepare: ({ title, subtitle }) => ({
      title: title?.toUpperCase(),
      subtitle: subtitle?.slice(0, 60),
    }),
  },
});
