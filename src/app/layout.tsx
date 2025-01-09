import { Providers } from './providers'
import { Toaster } from "sonner"
import './globals.css'
import { metadata, viewport } from './metadata'

export { metadata, viewport }
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      data-domain={process.env.NEXT_PUBLIC_APP_URL} 
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
