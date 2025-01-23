"use client";

import { useEffect, useState } from "react";
import { ListCard } from "@/components/lists/list-card";
import { ListSearchControls } from "@/components/lists/list-search-controls";
import type { List, ListCategory } from "@/types/list";
import { LIST_CATEGORIES } from "@/types/list";
import { useAuth } from "@clerk/nextjs";

interface ListGridProps {
  lists: List[];
  searchParams?: {
    q?: string;
    category?: string;
    sort?: string;
  };
  showPrivacyBadge?: boolean;
  isFollowing?: boolean;
  lastViewedMap?: Record<string, Date>;
}

export function ListGrid({ lists, searchParams, showPrivacyBadge, isFollowing, lastViewedMap: initialLastViewedMap }: ListGridProps) {
  const { userId } = useAuth();
  const [lastViewedMap, setLastViewedMap] = useState<Record<string, Date>>(initialLastViewedMap || {});
  
  useEffect(() => {
    if (!userId) return;
    
    // Only fetch for lists not already in the map
    const listsToFetch = lists.filter(list => !lastViewedMap[list.id]);
    if (listsToFetch.length === 0) return;

    const fetchPinData = async () => {
      try {
        const response = await fetch('/api/pins/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listIds: listsToFetch.map(l => l.id) })
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        setLastViewedMap(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error('Failed to fetch pin data:', error);
      }
    };

    fetchPinData();
  }, [userId, lists, lastViewedMap]);

  const category = searchParams?.category && LIST_CATEGORIES.includes(searchParams.category as ListCategory) 
    ? searchParams.category as ListCategory 
    : undefined;

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
        defaultCategory={category}
        defaultSort={searchParams?.sort}
      />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard 
            key={list.id}
            list={list}
            showPrivacyBadge={showPrivacyBadge}
            _isFollowing={isFollowing}
            lastViewedAt={lastViewedMap?.[list.id]}
          />
        ))}
      </div>
    </div>
  );
} 