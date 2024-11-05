"use client";

import { SearchInput } from "@/components/search/search-input";
import { FilterSheet } from "@/components/search/filter-sheet";
import { ListCategory } from "@/types/list";

interface SearchFormProps {
  defaultValues?: {
    q?: string;
    category?: ListCategory;
    sort?: string;
  };
}

export function SearchForm({ defaultValues }: SearchFormProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <SearchInput 
          placeholder="Search lists..."
          defaultValue={defaultValues?.q}
        />
      </div>
      <FilterSheet 
        defaultCategory={defaultValues?.category}
        defaultSort={defaultValues?.sort}
      />
    </div>
  );
} 