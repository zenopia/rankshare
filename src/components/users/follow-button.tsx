"use client";

import { Button } from "@/components/ui/button";
import { useFollow } from "@/hooks/use-follow";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const { toggleFollow, isLoading } = useFollow();

  return (
    <Button 
      variant={isFollowing ? "outline" : "default"}
      onClick={() => toggleFollow(userId)}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : (isFollowing ? "Unfollow" : "Follow")}
    </Button>
  );
} 