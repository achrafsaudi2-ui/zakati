// =============================================================================
// Sanity Studio — Zakati admin control panel
// =============================================================================
// Lives at studio.zakati.app (Sanity-hosted) or /studio path locally.
// =============================================================================

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { deskStructure } from './structure';

export default defineConfig({
  name: 'zakati',
  title: 'Zakati Admin',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'TBD_AT_SETUP',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(), // GROQ query playground — for power users
  ],

  schema: { types: schemaTypes },

  // Hide standard "Create" button for singleton-by-design docs
  document: {
    actions: (prev, ctx) => {
      const singletons = ['siteCopy', 'pdfReportConfig', 'nisabFallback', 'announcement'];
      if (singletons.includes(ctx.schemaType)) {
        return prev.filter(({ action }) => !['duplicate', 'delete'].includes(action ?? ''));
      }
      return prev;
    },
  },
});
