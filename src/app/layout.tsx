import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { auth } from '@clerk/nextjs'
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rankshare.app'),
  title: {
    default: 'RankShare',
    template: '%s | RankShare'
  },
  description: 'Create and share ranked lists of your favorite things',
  keywords: ['ranking', 'lists', 'recommendations', 'sharing'],
  authors: [{ name: 'RankShare Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rankshare.app',
    siteName: 'RankShare',
    title: 'RankShare - Create and Share Ranked Lists',
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
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();
  const isAuthenticated = !!userId;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}>
        <ClerkProvider>
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
