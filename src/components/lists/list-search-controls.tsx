"use client";

import { useSearchParams } from 'next/navigation';
import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import type { ListCategory, ListPrivacy } from "@/types/list";

interface ListSearchControlsProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: ListPrivacy | 'all';
  defaultQuery?: string;
  hideSearch?: boolean;
}

export function ListSearchControls({
  defaultCategory,
  defaultSort,
  defaultPrivacy,
  defaultQuery,
  hideSearch = false,
}: ListSearchControlsProps) {
  const searchParams = useSearchParams();

  // Get values safely with null checks
  const queryValue = searchParams?.get('q') ?? defaultQuery;
  const categoryValue = searchParams?.get('category') as ListCategory ?? defaultCategory;
  const sortValue = searchParams?.get('sort') ?? defaultSort;
  const privacyValue = searchParams?.get('privacy') as ListPrivacy | 'all' ?? defaultPrivacy;

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${hideSearch ? 'sm:justify-end' : ''}`}>
      {!hideSearch && (
        <div className="flex-1">
          <SearchInput 
            placeholder="Search your lists..."
            defaultValue={queryValue}
          />
        </div>
      )}
      <FilterSheet 
        defaultCategory={categoryValue}
        defaultSort={sortValue}
        defaultPrivacy={privacyValue}
        showPrivacyFilter={false}
      />
    </div>
  );
} 