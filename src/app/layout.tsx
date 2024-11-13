import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { Metadata, Viewport } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://curate.fileopia.com'),
  title: {
    default: 'Curate',
    template: '%s | Curate'
  },
  description: 'Create and share ranked lists of your favorite things',
  keywords: ['ranking', 'lists', 'recommendations', 'sharing'],
  authors: [{ name: 'Curate Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://curate.fileopia.com',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let isAuthenticated = false;

  try {
    const { userId } = await auth();
    isAuthenticated = !!userId;
  } catch (error) {
    console.error('Auth initialization error:', error);
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <div className="flex flex-1">
                {isAuthenticated && <Sidebar className="hidden md:flex" />}
                <ErrorBoundary>
                  <main className="flex-1">{children}</main>
                </ErrorBoundary>
              </div>
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
