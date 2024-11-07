"use client";

import { useSearchParams } from "next/navigation";
import { useLists } from "@/hooks/use-lists";
import { ListCard } from "@/components/lists/list-card";
import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import type { ListCategory } from "@/types/list";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { data: lists, isLoading, error } = useLists(searchParams);

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Search Lists</h1>
        <p className="text-muted-foreground">
          Find lists created by the community
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput 
            placeholder="Search lists..."
            defaultValue={searchParams.get('q') ?? ''}
          />
        </div>
        <FilterSheet 
          defaultCategory={searchParams.get('category') as ListCategory}
          defaultSort={searchParams.get('sort') ?? 'newest'}
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Error loading lists</p>
        </div>
      ) : !lists || lists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No lists found</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
            />
          ))}
        </div>
      )}
    </div>
  );
} 