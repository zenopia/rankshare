"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicListTabs = dynamic(
  () => import('./list-tabs').then((mod) => mod.ListTabs),
  {
    ssr: false,
    loading: () => (
      <div className="border-b bg-background">
        <div className="px-4 md:px-6 lg:px-8">
          <nav className="flex w-full -mb-px" aria-label="Tabs">
            <div className="flex-1 px-3 py-3.5 text-sm font-medium border-b-2 border-transparent">
              Loading...
            </div>
          </nav>
        </div>
      </div>
    ),
  }
);

export function ListTabsWrapper() {
  return (
    <Suspense fallback={null}>
      <DynamicListTabs />
    </Suspense>
  );
} 