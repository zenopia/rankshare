'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, Globe, Lock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
import { UserProfileBase } from '@/components/users/user-profile-base';
import { ScrollArea } from '@/components/ui/scroll-area';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { isValidEmail } from '@/lib/utils';
import { getListCollaborators, addListCollaborator, updateCollaboratorRole, removeListCollaborator, updateListPrivacy } from '@/lib/api/lists';
import { CollaboratorRole, ListCollaborator, COLLABORATOR_ROLES, ListPrivacy } from '@/types/list';

interface UserProfile {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

interface FollowingUser {
  clerkId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

interface SelectedUser {
  id: string;
  userId?: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string;
  isOwner?: boolean;
  role?: CollaboratorRole;
}

interface CollaboratorManagementProps {
  listId: string;
  isOwner: boolean;
  isAdmin: boolean;
  privacy: ListPrivacy;
  onPrivacyChange?: (privacy: ListPrivacy) => void;
}

export function CollaboratorManagement({ listId, isOwner, isAdmin, privacy, onPrivacyChange }: CollaboratorManagementProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load existing collaborators
  const loadCollaborators = useCallback(async () => {
    try {
      const { collaborators } = await getListCollaborators(listId);
      
      // Get all userIds that need profiles
      const userIds = collaborators
        .filter((c: ListCollaborator) => c.userId)
        .map((c: ListCollaborator) => c.userId)
        .join(',');

      // Fetch user profiles if we have any userIds
      let profiles: Record<string, UserProfile> = {};
      if (userIds) {
        const response = await fetch(`/api/users/batch?ids=${userIds}`);
        profiles = await response.json();
      }

      const users: SelectedUser[] = collaborators.map((c: ListCollaborator) => {
        const profile = c.userId ? profiles[c.userId] : null;
        return {
          id: c.userId || c.email || '',
          userId: c.userId || '',
          email: c.email || '',
          name: profile ? (profile.username || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()) : (c.email ? c.email.split('@')[0] : ''),
          role: c.role,
          isOwner: c.role === 'owner',
          imageUrl: profile?.imageUrl || c.imageUrl || '',
          username: profile?.username || '',
          firstName: profile?.firstName || null,
          lastName: profile?.lastName || null
        };
      });
      
      setSelectedUsers(users);
    } catch (error) {
      console.error('Failed to load collaborators:', error);
    }
  }, [listId]);

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  // Remove the separate userProfiles fetch since we're now loading them with collaborators
  const { data: followingUsers } = useSWR<{ results: FollowingUser[] }>('/api/users/following');

  const isEmail = isValidEmail(searchTerm);
  
  const filteredUsers = followingUsers?.results?.filter(user => 
    !selectedUsers.some(selected => selected.id === user.clerkId) && (
      searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelect = async (user: FollowingUser) => {
    try {
      await addListCollaborator(listId, user.clerkId);
      await loadCollaborators();
      setSearchTerm('');
      setIsFocused(false);
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    }
  };

  const handleEmailSubmit = async () => {
    if (isEmail) {
      try {
        await addListCollaborator(listId, searchTerm);
        await loadCollaborators();
        setSearchTerm('');
      } catch (error) {
        console.error('Failed to add collaborator:', error);
      }
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'remove') {
        await removeListCollaborator(listId, userId);
      } else if (action === 'make-owner') {
        await updateCollaboratorRole(listId, userId, 'owner');
      } else {
        await updateCollaboratorRole(listId, userId, action as CollaboratorRole);
      }
      await loadCollaborators();
    } catch (error) {
      console.error('Failed to update collaborator:', error);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const handlePrivacyChange = async (newPrivacy: ListPrivacy) => {
    try {
      await updateListPrivacy(listId, newPrivacy);
      onPrivacyChange?.(newPrivacy);
    } catch (error) {
      console.error('Failed to update privacy:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Trigger Button */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <UserIcon className="h-4 w-4" />
      </Button>

      {/* Sheet Content */}
      <div 
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[400px] bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          "border-l",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Collaborators</h2>
              <p className="text-sm text-muted-foreground sr-only">
                Manage who has access to this list
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="space-y-4">
            {/* Privacy selector */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">General access</h3>
              <div className="flex items-start gap-3">
                {privacy === 'private' ? (
                  <Lock className="h-4 w-4 mt-2" />
                ) : (
                  <Globe className="h-4 w-4 mt-2" />
                )}
                <div className="flex-1">
                  <select
                    value={privacy}
                    onChange={(e) => handlePrivacyChange(e.target.value as ListPrivacy)}
                    className="w-full bg-transparent text-sm mb-1"
                  >
                    <option value="private">Restricted</option>
                    <option value="public">Anyone with the link</option>
                  </select>
                  <span className="text-xs text-muted-foreground">
                    {privacy === 'private' 
                      ? "Only people with access can open with the link"
                      : "Anyone on the Internet with the link can view"
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-border" />

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                placeholder="Add people I follow or email invite"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEmail) {
                    handleEmailSubmit();
                  }
                }}
                className="pl-9"
              />
              {(isFocused || searchTerm.length > 0) && (
                <div className="absolute w-full mt-1 bg-background border rounded-md shadow-md search-dropdown z-50">
                  <ScrollArea className="max-h-[350px]">
                    <div className="p-2">
                      {!filteredUsers?.length && !isEmail ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {isEmail && (
                            <button
                              onClick={handleEmailSubmit}
                              className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="flex flex-col items-start">
                                <span>Invite "{searchTerm}"</span>
                                <span className="text-xs text-muted-foreground">Send invitation email</span>
                              </div>
                            </button>
                          )}
                          {filteredUsers?.map((user) => (
                            <button
                              key={user.clerkId}
                              onClick={() => {
                                handleSelect(user);
                                setIsFocused(false);
                              }}
                              className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <UserProfileBase
                                userId={user.clerkId}
                                username={user.username}
                                firstName={user.firstName}
                                lastName={user.lastName}
                                imageUrl={user.imageUrl}
                                variant="compact"
                                hideFollow
                                linkToProfile={false}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">People with access</h3>
                <div className="space-y-2">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="flex items-center gap-2">
                        {!user.userId ? (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">{user.email[0].toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        ) : (
                          <UserProfileBase
                            userId={user.userId}
                            username={user.username || user.name}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            imageUrl={user.imageUrl}
                            variant="compact"
                            hideFollow
                            linkToProfile={false}
                          />
                        )}
                      </div>
                      {user.isOwner ? (
                        <span className="text-sm text-muted-foreground">Owner</span>
                      ) : (
                        <select 
                          className="text-sm bg-transparent border rounded px-2 py-1"
                          onChange={(e) => handleUserAction(user.id, e.target.value)}
                          value={user.role || 'viewer'}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          {isOwner && (
                            <option value="make-owner">Make owner</option>
                          )}
                          <option value="remove" className="text-destructive">Remove</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 