"use client";

import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import { SearchResults } from "@/components/search/search-results";
import { PeopleResults } from "@/components/search/people-results";
import { SearchTabs } from "@/components/search/search-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import { useSearchParams } from "next/navigation";
import type { ListCategory } from "@/types/list";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "lists";
  const searchQuery = searchParams?.get("q") || "";

  // Convert searchParams to a regular object for SearchResults
  const searchParamsObject = {
    q: searchParams?.get("q") || undefined,
    category: (searchParams?.get("category") as ListCategory) || undefined,
    sort: (searchParams?.get("sort") as "newest" | "most-viewed") || undefined
  };

  return (
    <div className="container py-8 has-fab">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find {currentTab === "lists" ? "lists created by the community" : "people to follow"}
        </p>
      </div>

      <SearchTabs />

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="flex-1">
          <SearchInput 
            placeholder={`Search ${currentTab}...`}
            defaultValue={searchQuery}
          />
        </div>
        {currentTab === "lists" && (
          <FilterSheet 
            defaultCategory={(searchParams?.get("category") as ListCategory) || undefined}
            defaultSort={(searchParams?.get("sort") as "newest" | "most-viewed") || undefined}
          />
        )}
      </div>

      {/* Results */}
      {currentTab === "lists" ? (
        <SearchResults searchParams={searchParamsObject} />
      ) : (
        <PeopleResults />
      )}

      <CreateListFAB />
    </div>
  );
} 