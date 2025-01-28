"use client";

import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/layout/nav/list-tabs";
import { CreateListFAB } from "@/components/layout/FABs/create-list-fab";
import type { EnhancedList } from "@/types/list";

interface MyListsContentProps {
  lists: EnhancedList[];
}

export function MyListsContent({ lists }: MyListsContentProps) {
  return (
    <div className="relative">
      <ListTabs />
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <ListGrid lists={lists} />
        </div>
      </div>
      <CreateListFAB />
    </div>
  );
} 