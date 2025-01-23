"use client";

import { UserProfileBase } from "@/components/users/user-profile-base";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useUsers } from "@/hooks/use-users";

export interface UserCardProps {
  username: string;
  isFollowing: boolean;
  isOwner?: boolean;
  linkToProfile?: boolean;
  displayName?: string;
  imageUrl?: string;
}

export function UserCard({ 
  username, 
  isFollowing: initialIsFollowing, 
  isOwner = false, 
  linkToProfile = true,
  displayName,
  imageUrl
}: UserCardProps) {
  const { data: users, isLoading } = useUsers(username ? [username] : undefined);
  const userData = users?.[0];
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userData?.username) return;
    
    setIsLoadingFollow(true);
    try {
      const response = await fetch(`/api/users/${userData.username}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error();

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  if (isLoading || !username) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
        {!isOwner && <div className="h-8 w-16 bg-muted animate-pulse rounded" />}
      </div>
    );
  }

  const content = (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <UserProfileBase
          username={userData?.username || username}
          firstName={displayName || userData?.displayName}
          lastName={null}
          imageUrl={imageUrl || userData?.imageUrl}
          variant="compact"
          hideFollow={true}
          linkToProfile={false}
        />
      </div>
      {!isOwner && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className="flex-shrink-0"
          onClick={handleFollowClick}
          disabled={isLoadingFollow || !userData?.username}
        >
          {isLoadingFollow ? 'Loading...' : (isFollowing ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Following
            </>
          ) : 'Follow')}
        </Button>
      )}
    </div>
  );

  if (linkToProfile) {
    return <Link href={`/@${userData?.username || username}`}>{content}</Link>;
  }

  return content;
} 