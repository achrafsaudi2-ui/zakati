import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@zakati/engine', '@zakati/document-pipeline'],

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },

  // NOTE: `async headers()` is intentionally removed.
  // With output: 'export' it is unsupported. Security headers are served
  // by Cloudflare Pages via apps/web/public/_headers instead.

  webpack: (config, { isServer }) => {
    config.resolve.alias = config.resolve.alias || {};
    (config.resolve.alias as Record<string, unknown>).canvas = false;

    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        url: false,
        crypto: false,
        stream: false,
        buffer: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },
};

export default config;
