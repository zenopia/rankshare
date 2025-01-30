"use client";

import { useState } from "react";
import { EnhancedList, ListItem } from "@/types/list";
import { CategoryBadge } from "@/components/lists/category-badge";
import ListActionBar from "@/components/lists/list-action-bar";
import { Eye, Pin, Copy, Lock, Pen, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EditListFAB } from "@/components/layout/FABs/edit-list-fab";
import { UserCard } from "@/components/users/user-card";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { CollaboratorManagement } from "@/components/lists/collaborator-management";
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
  isCollaborator,
  isPinned: initialIsPinned, 
  isFollowing,
  showCollaborators,
  onCollaboratorsClick 
}: ListViewProps) {
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const { user } = useUser();
  const userId = user?.id;

  const handlePinChange = (newIsPinned: boolean) => {
    setIsPinned(newIsPinned);
  };

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
    <div key="root" className="space-y-8">
      <div key="user-section" className="user-section">
        <UserCard
          username={list.owner.username}
          firstName={list.owner.displayName.split(' ')[0] || ''}
          lastName={list.owner.displayName.split(' ').slice(1).join(' ') || ''}
          imageUrl={list.owner.imageUrl || ''}
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
              owner={{
                clerkId: list.owner.clerkId,
                username: list.owner.username,
                imageUrl: list.owner.imageUrl || undefined
              }}
            />
          </ErrorBoundaryWrapper>
        </div>
      )}

      <div key="header-section" className="header-section space-y-4">
        <div key="header-content" className="flex items-start justify-between gap-4">
          <div key="title-description" className="space-y-1">
            <h1 className="text-2xl font-bold">{list.title}</h1>
            {list.description && (
              <p className="text-muted-foreground">{list.description}</p>
            )}
          </div>
          <div key="category-privacy" className="flex items-center gap-2">
            <CategoryBadge category={list.category} />
            {list.privacy === 'private' && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="items-section space-y-4">
        <h2 className="text-xl font-semibold">Items</h2>
        {Array.isArray(list.items) && list.items.length > 0 ? (
          <ul className="space-y-2">
            {list.items.map((item: ListItem, index: number) => {
              const itemKey = `item-${item.id}-${index}`;
              return (
                <li key={itemKey} className="flex items-stretch rounded-lg border bg-card">
                  <div className="flex items-center justify-center min-w-[3rem] bg-muted rounded-l-lg">
                    <span className="text-base font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="font-medium">{item.title}</div>
                    {item.comment && (
                      <div className="mt-1 text-sm text-muted-foreground">{item.comment}</div>
                    )}
                    {Array.isArray(item.properties) && item.properties.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {item.properties.map((prop: { id: string; type?: 'text' | 'link'; label: string; value: string; }) => {
                          const propKey = `${itemKey}-prop-${prop.id}`;
                          return (
                            <li key={propKey} className="text-sm text-muted-foreground">
                              {prop.type === 'link' ? (
                                <a
                                  key={`${propKey}-link`}
                                  href={prop.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {prop.value}
                                </a>
                              ) : (
                                <span key={`${propKey}-value`}>{prop.value}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div>No items in this list</div>
        )}
      </div>

      <div key="stats-section" className="stats-section space-y-4 border-t pt-4">
        <div key="stats-content" className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div key="views" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {list.stats.viewCount}
            </div>
            <div key="pins" className="flex items-center gap-1">
              <Pin className="h-3 w-3" />
              {list.stats.pinCount}
            </div>
            <div key="copies" className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              {list.stats.copyCount}
            </div>
          </div>
          <div key="timestamps" className="flex flex-col gap-1 text-right">
            {list.editedAt && 
              Math.floor(new Date(list.editedAt).getTime() / 60000) > 
              Math.floor(new Date(list.createdAt).getTime() / 60000) ? (
              <>
                <div className="flex items-center gap-1 justify-end">
                  <Pen className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(list.editedAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Plus className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 justify-end">
                <Plus className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(list.createdAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>

        <ListActionBar
          listId={list.id}
          isPinned={isPinned}
          onPinChange={handlePinChange}
        />
      </div>

      {canEdit && (
        <div key="fab-section" className="fab-section">
          <EditListFAB 
            listId={list.id} 
            username={list.owner.username}
          />
        </div>
      )}
    </div>
  );
} 