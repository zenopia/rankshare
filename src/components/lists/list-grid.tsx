"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PinButton } from "@/components/lists/pin-button";
import { ListGridSkeleton } from "@/components/lists/list-card-skeleton";
import { LoadingMore } from "@/components/ui/loading-indicator";
import { ListFilters } from "@/components/lists/list-filters";
import { ListSearch } from "@/components/lists/list-search";
import { CategoryBadge } from "@/components/lists/category-badge";
import { PrivacyBadge } from "@/components/lists/privacy-badge";
import { ListStats } from "@/components/lists/list-stats";
import { formatDateTime } from "@/lib/utils/date";
import type { List } from "@/types/list";

interface ListGridProps {
  lists: List[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  emptyMessage?: string;
  showPinButton?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  showPrivacy?: boolean;
  showStats?: boolean;
  initialIsPinned?: boolean;
  onPinSuccess?: () => void;
  getTimestamp?: (list: List) => string | undefined;
  getTimestampPrefix?: (list: List) => string;
}

export function ListGrid({
  lists,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  loadMoreRef,
  emptyMessage = "No lists found",
  showPinButton = true,
  showFilters = false,
  showSearch = false,
  showPrivacy = true,
  showStats = true,
  initialIsPinned = false,
  onPinSuccess,
  getTimestamp = (list) => list.createdAt,
  getTimestampPrefix = () => "Created",
}: ListGridProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showSearch && <ListSearch />}
        {showFilters && <ListFilters />}
        <ListGridSkeleton />
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="space-y-6">
        {showSearch && <ListSearch />}
        {showFilters && <ListFilters />}
        <Card className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSearch && <ListSearch />}
      {showFilters && <ListFilters />}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Card
              key={list.id}
              className="group relative flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/@${list.owner.username}/lists/${list.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="line-clamp-1 flex-1 font-medium">
                      {list.title}
                    </h3>
                    {showPrivacy && (
                      <PrivacyBadge
                        privacy={list.privacy}
                        showText={false}
                        className="h-5"
                      />
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {list.description || "No description"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CategoryBadge category={list.category} />
                  {showPinButton && (
                    <PinButton
                      listId={list.id}
                      initialIsPinned={initialIsPinned}
                      onSuccess={onPinSuccess}
                    />
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  By @{list.owner.username}
                </span>
                {showStats && (
                  <ListStats
                    viewCount={list.stats.viewCount}
                    pinCount={list.stats.pinCount}
                    itemCount={list.stats.itemCount}
                  />
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {getTimestamp(list) &&
                  `${getTimestampPrefix(list)} ${formatDateTime(
                    getTimestamp(list)!
                  )}`}
              </div>
            </Card>
          ))}
        </div>

        {hasMore && (
          <div ref={loadMoreRef}>
            {isLoadingMore && <LoadingMore />}
          </div>
        )}
      </div>
    </div>
  );
} 