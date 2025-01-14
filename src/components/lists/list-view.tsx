"use client";

import { List } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import { ListActionBar } from "@/components/lists/list-action-bar";
import { Eye, Pin, Copy, Lock } from "lucide-react";
import { format } from "date-fns";
import { EditListFAB } from "@/components/lists/edit-list-fab";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemCard } from "@/components/items/item-card";
import { UserCard } from "@/components/users/user-card";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { CollaboratorManagement } from "@/components/lists/collaborator-management";
import { useState } from "react";

interface ListViewProps {
  list: List;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
  isAuthenticated: boolean;
  currentUserId?: string | null;
  children?: React.ReactNode;
}

export function ListView({ list, isOwner, isPinned, isFollowing, isAuthenticated, currentUserId, children }: ListViewProps) {
  const [privacy, setPrivacy] = useState(list.privacy);
  
  const isAdmin = Boolean(list.collaborators?.some(
    c => c.userId === currentUserId && c.role === "admin" && c.status === "accepted"
  ));
  
  const isCollaborator = Boolean(list.collaborators?.some(
    c => c.userId === currentUserId && c.status === "accepted"
  ));

  return (
    <ErrorBoundaryWrapper>
      <div className="container max-w-7xl mx-auto px-0 md:px-6 lg:px-8 pb-14 space-y-8">
        {children}
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <UserCard 
              userId={list.ownerId}
              isFollowing={isFollowing}
              hideFollow={isOwner}
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold sm:text-3xl truncate">
                  {list.title}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryBadge 
                    category={list.category}
                    className="pointer-events-none"
                  />
                  {list.privacy === 'private' && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {isAuthenticated && (isOwner || isCollaborator) && (
                    <CollaboratorManagement
                      listId={list.id}
                      isOwner={isOwner}
                      isAdmin={isAdmin}
                      privacy={privacy}
                      onPrivacyChange={setPrivacy}
                    />
                  )}
                </div>
              </div>

              {list.description && (
                <p className="text-muted-foreground text-sm">{list.description}</p>
              )}
            </div>

            {/* Items section */}
            <div className="space-y-6">
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
            <div className="border-t pt-4">
              <div className="flex items-start justify-between text-sm text-muted-foreground">
                {/* Stats Row */}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-default">
                          <Eye className="h-4 w-4" />
                          <span>{list.viewCount}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Views</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-default">
                          <Copy className="h-4 w-4" />
                          <span>{list.totalCopies}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Copies</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-default">
                          <Pin className="h-4 w-4" />
                          <span>{list.pinCount}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Pins</TooltipContent>
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

        {/* Action buttons */}
        {isOwner ? (
          <>
            <EditListFAB listId={list.id} />
            <ListActionBar
              listId={list.id}
              isPinned={false}
              showPinButton={false}
              isAuthenticated={isAuthenticated}
            />
          </>
        ) : (
          <ListActionBar
            listId={list.id}
            isPinned={isPinned}
            showPinButton={true}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </ErrorBoundaryWrapper>
  );
} 