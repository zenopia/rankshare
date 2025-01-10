"use client";

import { SubNavbar } from "@/components/layout/sub-navbar";
import { ConditionalBottomNav } from "@/components/layout/conditional-bottom-nav";

interface SubLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function SubLayout({ children, title = "Page" }: SubLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SubNavbar title={title} />
      <main className="flex-1 px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        {children}
      </main>
      <ConditionalBottomNav />
    </div>
  );
} 