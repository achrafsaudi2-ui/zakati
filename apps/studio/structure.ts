// =============================================================================
// Sanity Desk Structure — organizes the sidebar for clarity
// =============================================================================

import type { StructureBuilder } from 'sanity/structure';

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Zakati Admin')
    .items([
      // ----- Singletons (one-of) -----
      S.listItem()
        .title('Site copy')
        .child(S.document().schemaType('siteCopy').documentId('siteCopy')),
      S.listItem()
        .title('PDF report')
        .child(S.document().schemaType('pdfReportConfig').documentId('pdfReportConfig')),
      S.listItem()
        .title('Nisab fallback')
        .child(S.document().schemaType('nisabFallback').documentId('nisabFallback')),
      S.listItem()
        .title('Announcement banner')
        .child(S.document().schemaType('announcement').documentId('announcement')),

      S.divider(),

      // ----- Methodology -----
      S.listItem()
        .title('View descriptions')
        .child(S.documentTypeList('viewDescription').title('Strict / Moderate / Lenient')),

      S.listItem()
        .title('Asset categories')
        .child(S.documentTypeList('assetCategory').title('Asset categories')),

      S.listItem()
        .title('Tooltips')
        .child(S.documentTypeList('tooltip').title('Per-field explanations')),

      S.divider(),

      // ----- Charity directory -----
      S.listItem()
        .title('Charity directory')
        .child(S.documentTypeList('charity').title('Verified charities')),

      S.divider(),

      // ----- Operational -----
      S.listItem()
        .title('Feature flags')
        .child(S.documentTypeList('featureFlag').title('Feature toggles')),

      S.listItem()
        .title('Share templates')
        .child(S.documentTypeList('shareTemplate').title('WhatsApp / Twitter / LinkedIn')),

      S.listItem()
        .title('Allowed currencies')
        .child(S.documentTypeList('currencyConfig').title('Supported currencies')),
    ]);
