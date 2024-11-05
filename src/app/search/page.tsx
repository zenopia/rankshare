import { Suspense } from "react";
import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import { SearchResults } from "@/components/search/search-results";
import { ListCategory } from "@/types/list";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
}

function isValidCategory(category: string | undefined): category is ListCategory {
  if (!category) return false;
  return ['movies', 'books', 'music', 'games', 'other', 'tv-shows', 'restaurants'].includes(category);
}

function isValidSort(sort: string | undefined): sort is "newest" | "most-viewed" {
  return sort === "newest" || sort === "most-viewed";
}

export const dynamic = 'force-dynamic'; // Force dynamic rendering for search

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedParams = {
    q: searchParams.q,
    category: isValidCategory(searchParams.category) ? searchParams.category : undefined,
    sort: isValidSort(searchParams.sort) ? searchParams.sort : undefined,
  };

  return (
    <div className="container py-8">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Search Lists</h1>
        <p className="text-muted-foreground">
          Find lists by title, category, or sort by different criteria
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput 
            placeholder="Search lists..."
            defaultValue={resolvedParams.q}
          />
        </div>
        <FilterSheet 
          defaultCategory={resolvedParams.category}
          defaultSort={resolvedParams.sort}
        />
      </div>

      {/* Results */}
      <Suspense fallback={
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      }>
        <SearchResults searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
} 