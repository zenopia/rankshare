"use client";

import { UserProfileBase } from "@/components/users/user-profile-base";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export interface UserCardProps {
  username: string;
  isFollowing: boolean;
  isOwner?: boolean;
  linkToProfile?: boolean;
  displayName?: string;
  imageUrl?: string | null;
}

export function UserCard({ 
  username, 
  isFollowing: initialIsFollowing, 
  isOwner = false, 
  linkToProfile = true,
  displayName,
  imageUrl
}: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!username) return;
    
    setIsLoadingFollow(true);
    try {
      const response = await fetch(`/api/users/${username}/follow`, {
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

  const content = (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <UserProfileBase
          username={username}
          firstName={displayName}
          lastName={null}
          imageUrl={imageUrl || undefined}
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
          disabled={isLoadingFollow}
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
    return <Link href={`/${username}`}>{content}</Link>;
  }

  return content;
} 