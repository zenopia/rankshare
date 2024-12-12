import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "sonner"
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { Metadata, Viewport } from 'next';
import { auth } from '@clerk/nextjs/server'


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

  // Check if we're in dev environment
  const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true';

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`min-h-screen font-sans antialiased ${isDev ? 'bg-purple-50' : ''}`}>
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
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
