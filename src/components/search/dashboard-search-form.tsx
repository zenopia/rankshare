"use client";

import { SearchControls } from "@/components/ui/search-controls";
import type { ListCategory, ListPrivacyFilter } from "@/types/list";

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
    <SearchControls
      defaultValues={defaultValues}
      placeholder="Search your lists..."
      showPrivacyFilter={true}
      useUrlParams={true}
    />
  );
} 