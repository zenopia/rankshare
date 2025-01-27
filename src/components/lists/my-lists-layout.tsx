"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { SearchInput } from "@/components/search/search-input";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/lists/list-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import type { EnhancedList } from "@/types/list";

interface MyListsLayoutProps {
  lists: EnhancedList[];
  searchQuery?: string;
}

export function MyListsLayout({ lists, searchQuery }: MyListsLayoutProps) {
  return (
    <MainLayout>
      <div className="relative">
        <ListTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <SearchInput 
              placeholder="Search lists..." 
              defaultValue={searchQuery}
            />
            <ListGrid lists={lists} />
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 