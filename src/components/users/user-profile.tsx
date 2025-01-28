"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Tabs } from "./profile-tabs";

interface UserProfileProps {
  userId: string;
  username: string;
  displayName: string;
  imageUrl: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export function UserProfile({ 
  userId, 
  username, 
  displayName, 
  imageUrl,
  followerCount,
  followingCount,
  isFollowing: initialIsFollowing,
  isOwnProfile
}: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST'
      });

      if (!response.ok) throw new Error();

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? `Unfollowed ${username}` : `Following ${username}`);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={imageUrl} alt={username} />
              <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground">@{username}</p>
            </div>
          </div>

          {!isOwnProfile && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>

        <Tabs 
          username={username}
          followerCount={followerCount}
          followingCount={followingCount}
          activeTab="lists"
        />
      </Card>
    </div>
  );
} 