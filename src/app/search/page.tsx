"use client";

import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";
import { SearchTabs } from "@/components/search/search-tabs";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || "";

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="max-w-md">
          <SearchInput 
            placeholder="Search lists and people..." 
            defaultValue={searchQuery}
          />
        </div>

        <SearchTabs />
        
        <SearchResults />
      </div>

      <CreateListFAB />
    </div>
  );
} 