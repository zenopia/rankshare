"use client";

import { List } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import { ListActionBar } from "@/components/lists/list-action-bar";
import { Eye, Pin, Copy } from "lucide-react";
import { format } from "date-fns";
import { EditListFAB } from "@/components/lists/edit-list-fab";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemCard } from "@/components/items/item-card";
import { UserCard } from "@/components/users/user-card";

interface ListViewProps {
  list: List;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
  children?: React.ReactNode;
}

export function ListView({ list, isOwner, isPinned, isFollowing, children }: ListViewProps) {
  return (
    <div className="container py-8">
      {children}
      <div className="max-w-3xl mx-auto px-4">
        <UserCard 
          userId={list.ownerId}
          isFollowing={isFollowing}
          hideFollow={isOwner}
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

          {/* Items section */}
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-semibold">Items</h2>
            <div className="space-y-4">
              {list.items.map((item) => (
                <ItemCard 
                  key={item.id}
                  listId={list.id}
                  item={{
                    rank: item.rank,
                    title: item.title,
                    comment: item.comment
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 border-t pt-4">
            <div className="flex items-start justify-between text-sm text-muted-foreground">
              {/* Stats Row */}
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="tabular-nums">{list.viewCount}</span>
                    </TooltipTrigger>
                    <TooltipContent>Views</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2">
                      <Pin className="h-4 w-4" />
                      <span className="tabular-nums">{list.pinCount}</span>
                    </TooltipTrigger>
                    <TooltipContent>Pins</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      <span className="tabular-nums">{list.totalCopies}</span>
                    </TooltipTrigger>
                    <TooltipContent>Copies</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Dates - Now aligned right */}
              <div className="flex flex-col items-end gap-1">
                <span>Created: {format(new Date(list.createdAt), 'PPP')}</span>
                {list.lastEditedAt && new Date(list.lastEditedAt).getTime() !== new Date(list.createdAt).getTime() && (
                  <span>Edited: {format(new Date(list.lastEditedAt), 'PPP')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOwner ? (
        <>
          <EditListFAB listId={list.id} />
          <ListActionBar
            listId={list.id}
            isPinned={false}
            showPinButton={false}
          />
        </>
      ) : (
        <ListActionBar
          listId={list.id}
          isPinned={isPinned ?? false}
          showPinButton={true}
        />
      )}
    </div>
  );
} 