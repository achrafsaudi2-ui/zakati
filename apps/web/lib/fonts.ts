import { Inter, Geist, Cormorant_Garamond } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-loaded',
  weight: ['400', '500'],
});

export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display-loaded',
  weight: ['400', '500'],
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif-loaded',
  weight: ['400', '500'],
});
