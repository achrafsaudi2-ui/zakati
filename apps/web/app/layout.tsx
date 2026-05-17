import type { Metadata, Viewport } from 'next';
import { inter, geist, cormorant } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://zakati.app'),
  title: {
    default: 'Zakati — Your zakat, computed clearly',
    template: '%s · Zakati',
  },
  description:
    'Calculate your zakat across multiple currencies, on your device. No accounts, no ads, no tracking. Built as sadaqah jariyah.',
  applicationName: 'Zakati',
  appleWebApp: { capable: true, title: 'Zakati', statusBarStyle: 'default' },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/icons/icon-512.png', sizes: '512x512' },
    ],
    apple: '/icons/apple-icon.png',
  },
  openGraph: {
    title: 'Zakati — Your zakat, computed clearly',
    description: 'Multi-currency. Three views. Nothing leaves your device.',
    url: 'https://zakati.app',
    siteName: 'Zakati',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f8f4ec',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(inter.variable, geist.variable, cormorant.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
