"use client";

import Link from "next/link";
import { Lock, Eye, Pin, Plus, Pen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/lists/category-badge";
import { formatDistanceToNow } from "date-fns";
import type { List } from "@/types/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers } from "@/hooks/use-users";
import { usePathname } from "next/navigation";

interface ListCardProps {
  list: List;
  showPrivacyBadge?: boolean;
}

export function ListCard({
  list,
  showPrivacyBadge = true
}: ListCardProps) {
  const { data: userData } = useUsers([list.owner.clerkId]);
  const ownerData = userData?.[0];
  const currentPath = usePathname();

  return (
    <Link href={`/lists/${list.id}?from=${encodeURIComponent(currentPath)}`}>
      <Card className="group relative overflow-hidden transition-colors hover:bg-accent">
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold leading-none tracking-tight">
                {list.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-muted-foreground">{list.items?.length || 0} items</span>
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
          </div>

          <div className="h-px bg-border" />

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {list.stats.viewCount}
              </div>
              <div className="flex items-center gap-1">
                <Pin className="h-3 w-3" />
                {list.stats.pinCount}
              </div>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {list.editedAt && 
                  Math.floor(new Date(list.editedAt).getTime() / 60000) > 
                  Math.floor(new Date(list.createdAt).getTime() / 60000) ? (
                  <div className="flex items-center gap-1">
                    <Pen className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(list.editedAt), { addSuffix: true })}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
} 