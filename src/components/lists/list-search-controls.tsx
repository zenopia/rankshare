"use client";

import { SearchControls } from "@/components/ui/search-controls";
import type { ListCategory, ListPrivacy } from "@/types/list";

interface ListSearchControlsProps {
  defaultCategory?: ListCategory;
  defaultSort?: string;
  defaultPrivacy?: ListPrivacy | 'all';
  defaultQuery?: string;
  hideSearch?: boolean;
  className?: string;
}

export function ListSearchControls({
  defaultCategory,
  defaultSort,
  defaultPrivacy,
  defaultQuery,
  hideSearch = false,
  className,
}: ListSearchControlsProps) {
  return (
    <SearchControls
      defaultValues={{
        q: defaultQuery,
        category: defaultCategory,
        sort: defaultSort,
        privacy: defaultPrivacy,
      }}
      placeholder="Search your lists..."
      hideSearch={hideSearch}
      showPrivacyFilter={false}
      className={className}
      useUrlParams={true}
    />
  );
} 