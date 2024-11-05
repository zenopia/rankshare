"use client";

import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import { ListCategory, ListPrivacy, ListPrivacyFilter } from "@/types/list";

interface DashboardSearchFormProps {
  defaultValues?: {
    q?: string;
    category?: ListCategory;
    sort?: string;
    privacy?: ListPrivacyFilter;
  };
}

export function DashboardSearchForm({ defaultValues }: DashboardSearchFormProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <SearchInput 
          placeholder="Search your lists..."
          defaultValue={defaultValues?.q}
        />
      </div>
      <FilterSheet 
        defaultCategory={defaultValues?.category}
        defaultSort={defaultValues?.sort}
        defaultPrivacy={defaultValues?.privacy}
        showPrivacyFilter={true}
      />
    </div>
  );
} 