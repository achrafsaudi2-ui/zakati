import { defineType, defineField } from 'sanity';

/** Single-line localized string. v1 ships English; ar/fr added without schema change. */
export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'ar', title: 'Arabic (العربية)', type: 'string' }),
    defineField({ name: 'fr', title: 'French', type: 'string' }),
  ],
});
