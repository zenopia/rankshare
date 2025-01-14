"use client";

import { SearchControls } from "@/components/ui/search-controls";
import type { ListCategory, OwnerFilter } from "@/types/list";
import type { ListPrivacyFilter as _ListPrivacyFilter } from "@/types/list";

interface ListSearchControlsProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: _ListPrivacyFilter;
  defaultQuery?: string;
  defaultOwner?: OwnerFilter;
  hideSearch?: boolean;
  showOwnerFilter?: boolean;
  showPrivacyFilter?: boolean;
  className?: string;
}

export function ListSearchControls({
  defaultCategory,
  defaultSort,
  defaultPrivacy,
  defaultQuery,
  defaultOwner,
  hideSearch = false,
  showOwnerFilter = false,
  showPrivacyFilter = true,
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