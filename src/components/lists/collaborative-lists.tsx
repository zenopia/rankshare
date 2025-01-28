"use client";

import { ListGrid } from "@/components/lists/list-grid";
import type { List } from "@/types/list";

interface CollaborativeListsProps {
  lists: List[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  onPin?: () => void;
}

export function CollaborativeLists({
  lists,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  loadMoreRef,
  onPin,
}: CollaborativeListsProps) {
  return (
    <ListGrid
      lists={lists}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMoreRef={loadMoreRef}
      emptyMessage="No collaborative lists"
      onPinSuccess={onPin}
      getTimestamp={(list) => list.updatedAt}
      getTimestampPrefix={() => "Updated"}
    />
  );
} 