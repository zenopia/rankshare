"use client";

import { useState } from "react";
import { EnhancedList, ListItem, ListPrivacy } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import { ListActions } from "@/components/lists/list-actions";
import { Eye, Pin, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditListFAB } from "@/components/lists/edit-list-fab";
import { UserCard } from "@/components/users/user-card";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { CollaboratorManagement } from "@/components/lists/collaborator-management";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@clerk/nextjs";

type CollaboratorRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface ListViewProps {
  list: EnhancedList;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
  isCollaborator: boolean;
  showCollaborators: boolean;
  onCollaboratorsClick: () => void;
}

export function ListView({ 
  list, 
  isOwner,
  isPinned,
  isFollowing,
  isCollaborator,
  showCollaborators,
  onCollaboratorsClick
}: ListViewProps) {
  const { isSignedIn } = useAuthGuard();
  const { user } = useUser();
  const userId = user?.id;

  const showPrivacyIcon = list.privacy === "private" || list.privacy === "unlisted";

  // Get current user's role from collaborators array
  const currentUserRole: CollaboratorRole | undefined = isOwner ? 'owner' : userId ? list.collaborators?.find(c => 
    c.clerkId === userId && 
    c.status === 'accepted'
  )?.role as CollaboratorRole : undefined;

  // Check if user has edit permissions (owner, admin, or editor)
  const canEdit = isOwner || (isCollaborator && userId && list.collaborators?.some(c => 
    c.clerkId === userId && 
    c.status === 'accepted' && 
    ['admin', 'editor'].includes(c.role)
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{list.title}</h1>
            {showPrivacyIcon && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {list.description && (
            <p className="text-muted-foreground">{list.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <CategoryBadge category={list.category} />
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {list.stats.viewCount}
            </div>
            <div className="flex items-center gap-1">
              <Pin className="h-4 w-4" />
              {list.stats.pinCount}
            </div>
            <div>
              Updated {formatDistanceToNow(new Date(list.updatedAt))} ago
            </div>
          </div>
        </div>
        <ListActions
          list={list}
          isOwner={isOwner}
          isCollaborator={isCollaborator}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Items</h2>
          {isOwner && (
            <EditListFAB
              listId={list.id}
              username={list.owner.username}
            />
          )}
        </div>
        <div className="space-y-4">
          {list.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {item.url}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Created by</h2>
        <UserCard
          username={list.owner.username}
          firstName={list.owner.displayName?.split(" ")[0]}
          lastName={list.owner.displayName?.split(" ").slice(1).join(" ")}
          imageUrl={list.owner.imageUrl || ""}
          isFollowing={isFollowing}
          hideFollow={isOwner}
        />
      </div>

      {showCollaborators && (
        <div key="collaborators-section" className="collaborators-section">
          <ErrorBoundaryWrapper>
            <CollaboratorManagement
              listId={list.id}
              isOwner={isOwner}
              privacy={list.privacy}
              onClose={onCollaboratorsClick}
              onPrivacyChange={(newPrivacy) => {
                list.privacy = newPrivacy;
              }}
              currentUserRole={currentUserRole}
            />
          </ErrorBoundaryWrapper>
        </div>
      )}
    </div>
  );
} 