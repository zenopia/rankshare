"use client";

import { List } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import { AuthorCard } from "@/components/users/author-card";
import { ListActionBar } from "@/components/lists/list-action-bar";
import { Eye, Pin, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditListFAB } from "@/components/lists/edit-list-fab";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemCard } from "@/components/items/item-card";

interface ListViewProps {
  list: List;
  isOwner?: boolean;
  isPinned?: boolean;
  isFollowing?: boolean;
  ownerUsername?: string | null;
}

export function ListView({ list, isOwner, isPinned, isFollowing, ownerUsername }: ListViewProps) {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4">
        <AuthorCard
          authorId={list.ownerId}
          name={list.ownerName}
          username={ownerUsername ?? list.ownerName}
          isFollowing={isFollowing ?? false}
          hideFollow={isOwner}
          imageUrl={list.ownerImageUrl}
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl truncate">
                {list.title}
              </h1>
              <CategoryBadge 
                category={list.category}
                className="flex-shrink-0"
              />
            </div>

            {list.description && (
              <p className="text-muted-foreground text-sm">{list.description}</p>
            )}
          </div>

          <div className="space-y-4">
            {list.items?.map((item) => (
              <ItemCard 
                key={`${item.rank}-${item.title}`}
                listId={list.id}
                item={item}
              />
            ))}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{list.viewCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of views</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Pin className="h-4 w-4" />
                      <span>{list.pinCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of times pinned</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      <span>{list.totalCopies || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of times copied</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-4">
              <span>Created {formatDistanceToNow(list.createdAt, { addSuffix: true })}</span>
              {list.lastEditedAt && (
                <>
                  <span>���</span>
                  <span>Edited {formatDistanceToNow(list.lastEditedAt, { addSuffix: true })}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwner ? (
        <EditListFAB listId={list.id} />
      ) : (
        <ListActionBar
          listId={list.id}
          isPinned={isPinned ?? false}
        />
      )}
    </>
  );
} 