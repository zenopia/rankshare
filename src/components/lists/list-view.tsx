"use client";

import { useState } from "react";
import { List } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import { ListActionBar } from "@/components/lists/list-action-bar";
import { Eye, Pin, Copy } from "lucide-react";
import { format } from "date-fns";
import { EditListFAB } from "@/components/lists/edit-list-fab";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItemCard } from "@/components/items/item-card";
import { UserCard } from "@/components/users/user-card";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { CollaboratorManagement } from "@/components/lists/collaborator-management";

interface ListViewProps {
  list: List;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
}

export function ListView({ list, isOwner, isPinned, isFollowing }: ListViewProps) {
  const [showCollaborators, setShowCollaborators] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{list.title}</h1>
            {list.description && (
              <p className="text-muted-foreground">{list.description}</p>
            )}
          </div>
          <CategoryBadge category={list.category} />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{list.stats.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Pin className="h-4 w-4" />
            <span>{list.stats.pinCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Copy className="h-4 w-4" />
            <span>{list.stats.copyCount}</span>
          </div>
          <span>•</span>
          <span>
            {list.lastEditedAt
              ? `Edited ${format(new Date(list.lastEditedAt), 'PP')}`
              : `Created ${format(new Date(list.createdAt), 'PP')}`}
          </span>
        </div>

        <UserCard
          userId={list.owner.id}
          displayName={list.owner.username}
          isFollowing={isFollowing}
        />

        <ListActionBar
          listId={list.id}
          canEdit={isOwner}
          isPinned={isPinned}
          onCollaboratorsClick={() => setShowCollaborators(true)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Items</h2>
        <div className="space-y-4">
          {list.items.map((item, index) => (
            <ItemCard
              key={item.id}
              title={item.title}
              comment={item.comment}
              properties={item.properties}
              position={index + 1}
            />
          ))}
        </div>
      </div>

      {isOwner && <EditListFAB listId={list.id} />}

      <ErrorBoundaryWrapper>
        {showCollaborators && (
          <CollaboratorManagement
            listId={list.id}
            isOwner={isOwner}
            privacy={list.privacy}
            onClose={() => setShowCollaborators(false)}
          />
        )}
      </ErrorBoundaryWrapper>
    </div>
  );
} 