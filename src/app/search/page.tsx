import { Suspense } from "react";
import { SearchForm } from "@/components/search/search-form";
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Validate and transform search parameters
  const resolvedParams = {
    q: searchParams.q,
    category: isValidCategory(searchParams.category) ? searchParams.category : undefined,
    sort: isValidSort(searchParams.sort) ? searchParams.sort : undefined,
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Search Lists</h1>
        <p className="text-muted-foreground">
          Find lists by title, category, or sort by different criteria
        </p>
      </div>

      <SearchForm
        defaultValues={{
          q: resolvedParams.q,
          category: resolvedParams.category,
          sort: resolvedParams.sort,
        }}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
} 