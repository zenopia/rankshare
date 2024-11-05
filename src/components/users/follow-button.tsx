"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export function FollowButton({ userId, isFollowing: initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error();

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
    </Button>
  );
} 