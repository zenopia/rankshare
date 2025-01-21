'use client';

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          footer: "hidden",
        }
      }}
      navigate={(to) => router.push(to)}
    >
      <SWRConfig 
        value={{
          fetcher: (url: string) => fetch(url).then(res => res.json())
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </SWRConfig>
    </ClerkProvider>
  );
} 