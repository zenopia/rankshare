import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import { GoogleTagManager } from "@/components/analytics/gtm"
import { metadata, viewport } from "./metadata"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export { metadata, viewport }

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  const isGtmEnabled = process.env.NEXT_PUBLIC_GTM_ENABLED === "true"
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html 
      lang="en" 
      data-domain={process.env.NEXT_PUBLIC_APP_URL} 
      suppressHydrationWarning
    >
      <head>
        {isGtmEnabled && gtmId && <GoogleTagManager gtmId={gtmId} />}
      </head>
      <body className={`min-h-screen font-sans antialiased ${inter.className}`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
