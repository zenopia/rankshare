"use client";

import { useSearchParams } from 'next/navigation';
import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import type { ListCategory, ListPrivacyFilter, OwnerFilter } from "@/types/list";
import { cn } from "@/lib/utils";

interface SearchControlsProps {
  defaultValues?: {
    q?: string;
    category?: ListCategory;
    sort?: string;
    privacy?: ListPrivacyFilter;
    owner?: OwnerFilter;
  };
  placeholder?: string;
  hideSearch?: boolean;
  showPrivacyFilter?: boolean;
  showOwnerFilter?: boolean;
  className?: string;
  searchInputClassName?: string;
  useUrlParams?: boolean;
}

export function SearchControls({
  defaultValues,
  placeholder = "Search...",
  hideSearch = false,
  showPrivacyFilter = false,
  showOwnerFilter = false,
  className,
  searchInputClassName,
  useUrlParams = false,
}: SearchControlsProps) {
  const searchParams = useSearchParams();

  // Get values from URL params if enabled
  const values = useUrlParams ? {
    q: searchParams?.get('q') ?? defaultValues?.q,
    category: (searchParams?.get('category') as ListCategory) ?? defaultValues?.category,
    sort: searchParams?.get('sort') ?? defaultValues?.sort,
    privacy: (searchParams?.get('privacy') as ListPrivacyFilter) ?? defaultValues?.privacy,
    owner: (searchParams?.get('owner') as OwnerFilter) ?? defaultValues?.owner,
  } : defaultValues;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-4",
      hideSearch && "sm:justify-end",
      className
    )}>
      {!hideSearch && (
        <div className={cn("flex-1", searchInputClassName)}>
          <SearchInput 
            placeholder={placeholder}
            defaultValue={values?.q}
          />
        </div>
      )}
      <FilterSheet 
        defaultCategory={values?.category}
        defaultSort={values?.sort}
        defaultPrivacy={values?.privacy}
        defaultOwner={values?.owner}
        showPrivacyFilter={showPrivacyFilter}
        showOwnerFilter={showOwnerFilter}
      />
    </div>
  );
} 