"use client";

import Link from "next/link";
import { Eye, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { List } from "@/types/list";

interface ListCardProps {
  list: List;
  showPrivacyBadge?: boolean;
  isFollowing?: boolean;
}

export function ListCard({
  list,
  showPrivacyBadge = true,
  isFollowing = false
}: ListCardProps) {
  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="group relative overflow-hidden transition-colors hover:bg-accent">
        {showPrivacyBadge && list.privacy === 'private' && (
          <Badge variant="outline" className="absolute right-4 top-4">
            <Lock className="h-3 w-3 mr-1" />
            Private
          </Badge>
        )}

        <div className="p-6">
          <h3 className="font-semibold leading-none tracking-tight">
            {list.title}
          </h3>

          {list.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {list.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{list.owner.username}</span>
            <span>•</span>
            <span>{list.items?.length || 0} items</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{list.stats.viewCount} views</span>
            <span>•</span>
            <span>{list.stats.pinCount} pins</span>
          </div>
        </div>
      </Card>
    </Link>
  );
} 