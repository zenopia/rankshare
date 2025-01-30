import { Providers } from './providers'
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
  const isGtmEnabled = process.env.NEXT_PUBLIC_GTM_ENABLED !== 'false';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isGtmEnabled && gtmId && <GoogleTagManager gtmId={gtmId} />}
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
