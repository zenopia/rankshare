import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "sonner"
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { Metadata, Viewport } from 'next';
import { ConditionalBottomNav } from '@/components/layout/conditional-bottom-nav'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export const dynamic = 'force-dynamic';

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
      { url: '/images/favicon.ico' },
      { url: '/images/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/images/apple-icon.png', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          footer: "hidden",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen font-sans antialiased">
          <Providers>
            <div className="relative min-h-screen">
              <Navbar />
              <div className="flex">
                <Sidebar className="hidden md:flex" />
                <main className="flex-1 pb-[4.5rem] sm:pb-0">
                  {children}
                </main>
              </div>
              <ConditionalBottomNav />
            </div>
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
