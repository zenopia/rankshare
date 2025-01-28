import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: "RankShare",
    template: "%s | RankShare",
  },
  description: "Share and discover ranked lists of your favorite things",
  keywords: ["ranking", "lists", "social", "sharing", "discover"],
  authors: [{ name: "RankShare" }],
  creator: "RankShare",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rankshare.app",
    title: "RankShare",
    description: "Share and discover ranked lists of your favorite things",
    siteName: "RankShare",
  },
  twitter: {
    card: "summary_large_image",
    title: "RankShare",
    description: "Share and discover ranked lists of your favorite things",
    creator: "@rankshare",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}; 