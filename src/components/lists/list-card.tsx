import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { List } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";

interface ListCardProps {
  list: List;
  showPrivacyBadge?: boolean;
  showUpdateBadge?: boolean;
}

export function ListCard({ list, showPrivacyBadge = false, showUpdateBadge = false }: ListCardProps) {
  const dateString = list.lastEditedAt && 
    new Date(list.lastEditedAt).getTime() !== new Date(list.createdAt).getTime()
    ? `Edited: ${formatDistanceToNow(new Date(list.lastEditedAt), { addSuffix: true })}`
    : `Created: ${formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}`;

  return (
    <Link
      href={`/lists/${list.id}`}
      className="block h-full overflow-hidden rounded-lg border bg-card hover:border-primary transition-colors"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold leading-none tracking-tight truncate">
                {list.title}
              </h3>
              <CategoryBadge 
                category={list.category}
                className="flex-shrink-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                by {list.ownerName}
              </p>
              {showUpdateBadge && list.hasUpdate && (
                <Badge variant="success" className="text-xs">Updated</Badge>
              )}
            </div>
          </div>
          {showPrivacyBadge && list.privacy === 'private' && (
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>

        {list.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground hidden sm:block">
            {list.description}
          </p>
        )}

        <div className="mt-2 sm:mt-4">
          <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
            Top {list.items.length > 0 ? '3' : '0'}: {list.items.slice(0, 3).map(item => item.title).join(", ")}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="tabular-nums">{list.viewCount}</span>
          </div>
          <span className="truncate ml-2">
            {dateString}
          </span>
        </div>
      </div>
    </Link>
  );
} 