import { defineType, defineField } from 'sanity';

export const featureFlag = defineType({
  name: 'featureFlag',
  title: 'Feature flag',
  type: 'document',
  description: 'Toggle features without redeploying.',
  fields: [
    defineField({
      name: 'flagKey',
      title: 'Flag key',
      type: 'string',
      description: 'E.g. "show_pdf_export", "show_charity_directory", "maintenance_mode", "show_email_optin".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'What does this flag do?',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'rolloutPercent',
      title: 'Rollout %',
      type: 'number',
      description: 'For gradual rollouts. 100 = everyone. 0 = nobody.',
      validation: (r) => r.min(0).max(100),
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: 'flagKey', enabled: 'enabled', rollout: 'rolloutPercent', desc: 'description' },
    prepare: ({ title, enabled, rollout, desc }) => ({
      title,
      subtitle: `${enabled ? '✓ on' : '✗ off'}${rollout != null && rollout < 100 ? ` (${rollout}%)` : ''} • ${desc ?? ''}`,
    }),
  },
});
