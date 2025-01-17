import { Metadata, Viewport } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Favely';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: 'Create and share ranked lists of your favorite things',
  keywords: ['ranking', 'lists', 'recommendations', 'sharing'],
  authors: [{ name: `${siteName} Team` }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title: `${siteName} - Create and Share Ranked Lists`,
    description: 'Create and share ranked lists of your favorite things',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}; 