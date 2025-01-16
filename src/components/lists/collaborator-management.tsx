'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { CollaboratorCard } from "@/components/users/collaborator-card";
import { UserCombobox } from "@/components/users/user-combobox";

interface Collaborator {
  userId: string;
  username: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

interface FollowingResult {
  followingId: string;
  user: {
    username: string;
    displayName: string;
    imageUrl?: string;
  };
}

interface CollaboratorManagementProps {
  listId: string;
  isOwner: boolean;
  privacy: 'public' | 'private';
  onClose: () => void;
  onPrivacyChange?: (privacy: 'public' | 'private') => void;
}

export function CollaboratorManagement({ 
  listId, 
  isOwner, 
  privacy: initialPrivacy,
  onClose,
  onPrivacyChange
}: CollaboratorManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);
  const [privacy, setPrivacy] = useState(initialPrivacy);

  useEffect(() => {
    // Trigger open animation after mount
    requestAnimationFrame(() => {
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch('/api/users/following');
        if (!response.ok) throw new Error();
        const data = await response.json();
        setFollowingIds(data.results.map((result: FollowingResult) => result.followingId));
      } catch (error) {
        console.error('Failed to fetch following:', error);
        toast.error("Failed to load following users");
      } finally {
        setIsLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, []);

  useEffect(() => {
    const fetchCollaborators = async () => {
      setIsLoadingCollaborators(true);
      try {
        const response = await fetch(`/api/lists/${listId}/collaborators`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCollaborators(data);
      } catch (error) {
        toast.error("Failed to load collaborators");
      } finally {
        setIsLoadingCollaborators(false);
      }
    };

    fetchCollaborators();
  }, [listId]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleInvite = async (value: { type: 'user', userId: string, username: string } | { type: 'email', email: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: value.type === 'email' ? value.email : undefined,
          userId: value.type === 'user' ? value.userId : undefined,
          role: "viewer",
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      // Refresh collaborators list
      const updatedResponse = await fetch(`/api/lists/${listId}/collaborators`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setCollaborators(data);
      }

      toast.success("Invitation sent!");
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrivacy = async () => {
    const newPrivacy = privacy === "public" ? "private" : "public";
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privacy: newPrivacy,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updatedList = await response.json();
      setPrivacy(updatedList.privacy);
      onPrivacyChange?.(updatedList.privacy);
      toast.success("Privacy updated!");
    } catch (error) {
      toast.error("Failed to update privacy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      // Refresh collaborators list
      const updatedResponse = await fetch(`/api/lists/${listId}/collaborators`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setCollaborators(data);
      }

      toast.success("Role updated!");
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error();
      }

      // Refresh collaborators list
      const updatedResponse = await fetch(`/api/lists/${listId}/collaborators`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setCollaborators(data);
      }

      toast.success("Collaborator removed!");
    } catch (error) {
      toast.error("Failed to remove collaborator");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      {/* Collaborator Sheet */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-[400px] bg-background p-6 shadow-lg",
          "border-l transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Manage Access</h2>
              <p className="text-sm text-muted-foreground">
                Control who can access this list.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="space-y-6">
            {/* Privacy section - visible to all, toggle only for owners and admins */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {privacy === "public" ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <h3 className="font-medium">
                      {privacy === "public" ? "Public" : "Private"} List
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {privacy === "public"
                      ? "Anyone can view this list"
                      : "Only collaborators can view this list"}
                  </p>
                </div>
                {(isOwner || collaborators.some(c => c.role === 'admin')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePrivacy}
                    disabled={isLoading}
                  >
                    Make {privacy === "public" ? "Private" : "Public"}
                  </Button>
                )}
              </div>
            </div>

            {/* Invite section - for owners and admins */}
            {(isOwner || collaborators.some(c => c.role === 'admin')) && (
              <>
                <div className="space-y-2">
                  <UserCombobox
                    placeholder="Add people..."
                    onSelect={handleInvite}
                    disabled={isLoading || isLoadingFollowing}
                    userIds={followingIds}
                    excludeUserIds={collaborators.map(c => c.userId)}
                  />
                </div>
                <div className="h-[1px] bg-border" />
              </>
            )}

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {isLoadingCollaborators ? (
                  // Show loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <CollaboratorCard
                        userId="loading"
                        username="loading"
                        role="viewer"
                        linkToProfile={false}
                      />
                    </div>
                  ))
                ) : (
                  collaborators.map((collaborator) => (
                    <CollaboratorCard
                      key={collaborator.userId}
                      userId={collaborator.userId}
                      username={collaborator.username}
                      role={collaborator.role}
                      linkToProfile={true}
                      canManageRoles={isOwner || collaborator.role === 'admin'}
                      isOwner={isOwner}
                      onRoleChange={(newRole) => handleRoleChange(collaborator.userId, newRole)}
                      onRemove={() => handleRemoveCollaborator(collaborator.userId)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
} 