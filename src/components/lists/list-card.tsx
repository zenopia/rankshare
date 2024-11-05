import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { List } from "@/types/list";

interface ListCardProps {
  list: List & { hasUpdate?: boolean };
  showPrivacyBadge?: boolean;
  showUpdateBadge?: boolean;
}

export function ListCard({ 
  list, 
  showPrivacyBadge = false,
  showUpdateBadge = false,
}: ListCardProps) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="block overflow-hidden rounded-lg border bg-card hover:border-primary touch-manipulation"
    >
      <div className="p-4 sm:p-6 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-semibold leading-none tracking-tight truncate">
              {list.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              by {list.ownerName}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {showUpdateBadge && list.hasUpdate && (
              <Badge variant="success" className="hidden sm:flex">Updated</Badge>
            )}
            {showPrivacyBadge && list.privacy === 'private' && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
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
            Edited {formatDistanceToNow(new Date(list.lastEditedAt || list.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
} 