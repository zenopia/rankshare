"use client";

import Link from "next/link";
import { Lock, Eye, Pin, PenLine, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/lists/category-badge";
import { formatDistanceToNow } from "date-fns";
import type { List } from "@/types/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers } from "@/hooks/use-users";

interface ListCardProps {
  list: List;
  showPrivacyBadge?: boolean;
}

export function ListCard({
  list,
  showPrivacyBadge = true
}: ListCardProps) {
  const isEdited = !!list.lastEditedAt;
  const timeAgo = formatDistanceToNow(new Date(list.lastEditedAt || list.createdAt), { addSuffix: true });
  const { data: userData } = useUsers([list.owner.clerkId]);
  const ownerData = userData?.[0];

  return (
    <Link href={`/lists/${list.id}`}>
      <Card className="group relative overflow-hidden transition-colors hover:bg-accent">
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold leading-none tracking-tight">
                {list.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CategoryBadge category={list.category} />
                {showPrivacyBadge && list.privacy === 'private' && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {list.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {list.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={ownerData?.imageUrl || undefined} alt={ownerData?.username || ''} />
              <AvatarFallback>{ownerData?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5">
              <span className="text-foreground">{ownerData?.displayName || ownerData?.username || 'Unknown User'}</span>
              <span className="text-muted-foreground">@{ownerData?.username || 'unknown'}</span>
            </div>
            <span>•</span>
            <span>{list.items?.length || 0} items</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{list.stats.viewCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Pin className="h-4 w-4" />
                <span>{list.stats.pinCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isEdited ? (
                <PenLine className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
} 