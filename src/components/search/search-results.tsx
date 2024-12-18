"use client";

import { ListCard } from "@/components/lists/list-card";
import { PeopleResults } from "@/components/search/people-results";
import type { List } from "@/types/list";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function SearchResults() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "lists";

  return (
    <div className="space-y-6">
      {currentTab === "lists" ? (
        <ListResults />
      ) : (
        <PeopleResults />
      )}
    </div>
  );
}

function ListResults() {
  const searchParams = useSearchParams();
  const [lists, setLists] = useState<(List & { hasUpdate: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        const q = searchParams.get("q");
        const category = searchParams.get("category");
        const sort = searchParams.get("sort");

        if (q) params.set("q", q);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);

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
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => (
        <ListCard 
          key={list.id} 
          list={list}
          showPrivacyBadge
        />
      ))}
    </div>
  );
} 