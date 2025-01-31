"use client";

import { cn } from "@/lib/utils";

interface ListLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ListLayout({ children, className }: ListLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen bg-background", className)}>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
} 