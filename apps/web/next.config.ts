import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@zakati/engine', '@zakati/document-pipeline'],

  // TypeScript and ESLint are run separately; the build itself
  // should not fail on type or lint errors.
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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Some PDF/canvas tooling references this on the server; stub it.
    config.resolve.alias = config.resolve.alias || {};
    (config.resolve.alias as Record<string, unknown>).canvas = false;

    if (!isServer) {
      // Browser bundle must never try to load Node built-ins.
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
