import { Providers } from './providers'
import { Toaster } from "sonner"
import './globals.css'
import { metadata, viewport } from './metadata'
import { GoogleTagManager } from '@/components/analytics/gtm'

export { metadata, viewport }
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.replace(/"/g, '');

  return (
    <html 
      lang="en" 
      data-domain={process.env.NEXT_PUBLIC_APP_URL} 
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
              });
            `,
          }}
        />
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
