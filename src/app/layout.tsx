import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1">
              {isSignedIn && <Sidebar />}
              <main className={`flex-1 ${!isSignedIn ? 'container mx-auto' : ''}`}>
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
