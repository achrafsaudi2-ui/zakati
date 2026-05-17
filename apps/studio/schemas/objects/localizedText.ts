import { defineType, defineField } from 'sanity';

/** Multi-line localized text. Use for paragraphs, tooltips, descriptions. */
export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized text',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'ar', title: 'Arabic (العربية)', type: 'text', rows: 3 }),
    defineField({ name: 'fr', title: 'French', type: 'text', rows: 3 }),
  ],
});
