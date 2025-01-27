"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/lists/list-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import type { EnhancedList } from "@/types/list";
import type { ListCategory } from "@/types/list";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
}

interface CollabListsLayoutProps {
  lists: EnhancedList[];
  searchParams?: SearchParams;
  lastViewedMap?: Record<string, Date>;
}

export function CollabListsLayout({ lists, searchParams, lastViewedMap }: CollabListsLayoutProps) {
  return (
    <MainLayout>
      <div className="relative">
        <ListTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-2xl mx-auto">
            <ListGrid 
              lists={lists} 
              searchParams={searchParams}
              showPrivacyBadge
              lastViewedMap={lastViewedMap}
            />
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 