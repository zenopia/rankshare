"use client";

import { ListCard } from "@/components/lists/list-card";
import type { List } from "@/types/list";
import { useEffect, useState } from "react";

interface SearchResultsProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: "newest" | "most-viewed";
  };
}

export function SearchResults({ searchParams }: SearchResultsProps) {
  const [lists, setLists] = useState<(List & { hasUpdate: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        // Convert searchParams to URLSearchParams
        const params = new URLSearchParams();
        if (searchParams.q) params.set("q", searchParams.q);
        if (searchParams.category) params.set("category", searchParams.category);
        if (searchParams.sort) params.set("sort", searchParams.sort);

        const response = await fetch(`/api/lists/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        
        const data = await response.json();
        setLists(data.lists);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setLists([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No lists found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <ListCard 
          key={list.id} 
          list={list}
          showUpdateBadge={list.hasUpdate}
        />
      ))}
    </div>
  );
} 