import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://curate-dev.fileopia.com'),
  title: 'Curate',
  description: 'Create and share ranked lists of your favorite things',
  keywords: ['ranking', 'lists', 'recommendations', 'sharing'],
  authors: [{ name: 'Curate Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://curate-dev.fileopia.com',
    siteName: 'Curate',
    title: 'Curate - Create and Share Ranked Lists',
    description: 'Create and share ranked lists of your favorite things',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/images/apple-icon.png', sizes: '180x180' },
    ],
  },
}; 