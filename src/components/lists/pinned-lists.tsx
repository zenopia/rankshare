"use client";

import { useEffect } from "react";
import { ListGrid } from "@/components/lists/list-grid";
import type { List } from "@/types/list";

interface PinnedListsProps {
  lists: List[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  onUnpin?: () => void;
}

export function PinnedLists({
  lists,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  loadMoreRef,
  onUnpin,
}: PinnedListsProps) {
  useEffect(() => {
    if (lists.length === 0) {
      onUnpin?.();
    }
  }, [lists.length, onUnpin]);

  return (
    <ListGrid
      lists={lists}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMoreRef={loadMoreRef}
      emptyMessage="No pinned lists yet"
      initialIsPinned={true}
      onPinSuccess={onUnpin}
      getTimestamp={(list) => list.pinnedAt}
      getTimestampPrefix={() => "Pinned"}
    />
  );
} 