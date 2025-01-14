"use client";

import { SearchControls } from "@/components/ui/search-controls";
import type { ListCategory, ListPrivacyFilter, OwnerFilter } from "@/types/list";

interface ListSearchControlsProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: ListPrivacyFilter;
  defaultOwner?: OwnerFilter;
  defaultQuery?: string;
  hideSearch?: boolean;
  showPrivacyFilter?: boolean;
  showOwnerFilter?: boolean;
  className?: string;
}

export function ListSearchControls({
  defaultCategory,
  defaultSort,
  defaultPrivacy,
  defaultOwner,
  defaultQuery,
  hideSearch = false,
  showPrivacyFilter = false,
  showOwnerFilter = false,
  className,
}: ListSearchControlsProps) {
  return (
    <SearchControls
      defaultValues={{
        q: defaultQuery,
        category: defaultCategory,
        sort: defaultSort,
        privacy: defaultPrivacy,
        owner: defaultOwner,
      }}
      placeholder="Search your lists..."
      hideSearch={hideSearch}
      showPrivacyFilter={showPrivacyFilter}
      showOwnerFilter={showOwnerFilter}
      className={className}
      useUrlParams={true}
    />
  );
} 