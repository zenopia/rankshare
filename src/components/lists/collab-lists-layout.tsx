"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/lists/list-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import type { EnhancedList } from "@/types/list";

interface CollabListsLayoutProps {
  lists: EnhancedList[];
}

export function CollabListsLayout({ lists }: CollabListsLayoutProps) {
  return (
    <MainLayout>
      <div className="relative">
        <ListTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-2xl mx-auto">
            <ListGrid lists={lists} />
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 