import type { MetadataRoute } from 'next';

// Required by Next.js 15 when `output: 'export'` is enabled.
// Tells the build to emit a static sitemap.xml file at build time.
export const dynamic = 'force-static';

const SITE_URL = 'https://zakati.app';

/**
 * Static sitemap. Wizard pages (/start, /setup, /categories, etc.) are
 * intentionally excluded — they only make sense with user state and would
 * confuse search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/charity`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/settings`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
