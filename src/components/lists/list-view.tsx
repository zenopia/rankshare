"use client";

import { useState } from "react";
import { List } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import ListActionBar from "@/components/lists/list-action-bar";
import { Eye, Pin, Copy, Lock, Pen, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditListFAB } from "@/components/lists/edit-list-fab";
import { UserCard } from "@/components/users/user-card";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { CollaboratorManagement } from "@/components/lists/collaborator-management";

interface ListViewProps {
  list: List;
  isOwner: boolean;
  _isCollaborator: boolean;
  isPinned: boolean;
  isFollowing: boolean;
  showCollaborators: boolean;
  onCollaboratorsClick: () => void;
}

export function ListView({ 
  list, 
  isOwner, 
  _isCollaborator,
  isPinned: initialIsPinned, 
  isFollowing,
  showCollaborators,
  onCollaboratorsClick 
}: ListViewProps) {
  const [isPinned, setIsPinned] = useState(initialIsPinned);

  const handlePinChange = (newIsPinned: boolean) => {
    setIsPinned(newIsPinned);
  };

  return (
    <div className="space-y-8">
      <div className="user-section">
        <UserCard
          userId={list.owner.clerkId}
          username={list.owner.username}
          isFollowing={isFollowing}
          isOwner={isOwner}
        />
      </div>

      {showCollaborators && (
        <div className="collaborators-section">
          <ErrorBoundaryWrapper>
            <CollaboratorManagement
              listId={list.id}
              isOwner={isOwner}
              privacy={list.privacy}
              onClose={onCollaboratorsClick}
              onPrivacyChange={(newPrivacy) => {
                // Update the list privacy locally
                list.privacy = newPrivacy;
              }}
            />
          </ErrorBoundaryWrapper>
        </div>
      )}

      <div className="header-section space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{list.title}</h1>
            {list.description && (
              <p className="text-muted-foreground">{list.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={list.category} />
            {list.privacy === 'private' && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="items-section space-y-4">
        <h2 className="text-xl font-semibold">Items</h2>
        <div className="space-y-2">
          {(list.items || []).map((item, index) => (
            <div
              key={item.id}
              className="flex items-stretch rounded-lg border bg-card"
            >
              <div className="flex items-center justify-center min-w-[3rem] bg-muted rounded-l-lg">
                <span className="text-base font-medium text-muted-foreground">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 p-4">
                <div className="font-medium">{item.title}</div>
                {item.comment && (
                  <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>
                )}
                {item.properties && item.properties.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.properties.map(prop => (
                      <div key={prop.id} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{prop.label}:</span>
                        {prop.type === 'link' ? (
                          <a href={prop.value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {prop.value}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{prop.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section space-y-4 border-t pt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {list.stats.viewCount}
            </div>
            <div className="flex items-center gap-1">
              <Pin className="h-3 w-3" />
              {list.stats.pinCount}
            </div>
            <div className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              {list.stats.copyCount}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            {list.editedAt && 
              Math.floor(new Date(list.editedAt).getTime() / 60000) > 
              Math.floor(new Date(list.createdAt).getTime() / 60000) ? (
              <>
                <div className="flex items-center gap-1">
                  <Pen className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(list.editedAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Plus className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>

        <ListActionBar
          listId={list.id}
          isPinned={isPinned}
          canManageCollaborators={isOwner || _isCollaborator}
          onPinChange={handlePinChange}
          onCollaboratorsClick={onCollaboratorsClick}
        />
      </div>

      {isOwner && (
        <div className="fab-section">
          <EditListFAB listId={list.id} />
        </div>
      )}
    </div>
  );
} 