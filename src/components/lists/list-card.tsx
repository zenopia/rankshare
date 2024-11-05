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
      className="block overflow-hidden rounded-lg border bg-card hover:border-primary"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">
              {list.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              by {list.ownerName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showUpdateBadge && list.hasUpdate && (
              <Badge variant="success">Updated</Badge>
            )}
            {showPrivacyBadge && list.privacy === 'private' && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {list.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {list.description}
          </p>
        )}

        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            Top 3: {list.items.slice(0, 3).map(item => item.title).join(", ")}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {list.viewCount}
          </div>
          <span>
            Updated {formatDistanceToNow(new Date(list.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
} 