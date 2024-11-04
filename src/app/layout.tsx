import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { auth } from '@clerk/nextjs'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata = {
  title: 'RankShare',
  description: 'Create and share ranked lists',
}

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
