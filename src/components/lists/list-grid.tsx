"use client";

import { ListCard } from "@/components/lists/list-card";
import { ListSearchControls } from "@/components/lists/list-search-controls";
import type { List } from "@/types/list";

interface ListGridProps {
  lists: List[];
  searchParams?: {
    q?: string;
    category?: string;
    sort?: string;
  };
  showPrivacyBadge?: boolean;
  isFollowing?: boolean;
}

export function ListGrid({ lists, searchParams, showPrivacyBadge, isFollowing }: ListGridProps) {
  if (lists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No lists found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ListSearchControls 
        defaultCategory={searchParams?.category}
        defaultSort={searchParams?.sort}
      />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard 
            key={list.id}
            list={list}
            showPrivacyBadge={showPrivacyBadge}
            isFollowing={isFollowing}
          />
        ))}
      </div>
    </div>
  );
} 