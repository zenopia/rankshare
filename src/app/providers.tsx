'use client';

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { ClerkProvider } from '@clerk/nextjs';
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
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
      navigate={(to) => window.location.href = to}
    >
      <SWRConfig 
        value={{
          fetcher: (url: string) => fetch(url).then(res => res.json())
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </SWRConfig>
    </ClerkProvider>
  );
} 