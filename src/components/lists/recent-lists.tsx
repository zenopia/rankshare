"use client";

import { ListGrid } from "@/components/lists/list-grid";
import type { List } from "@/types/list";

interface RecentListsProps {
  lists: List[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  onPin?: () => void;
}

export function RecentLists({
  lists,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  loadMoreRef,
  onPin,
}: RecentListsProps) {
  return (
    <ListGrid
      lists={lists}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMoreRef={loadMoreRef}
      emptyMessage="No recent lists"
      onPinSuccess={onPin}
      getTimestamp={(list) => list.createdAt}
      getTimestampPrefix={() => "Created"}
    />
  );
} 