"use client";

import useSWR from "swr";
import { UserProfileBase } from "@/components/users/user-profile-base";
import { Button } from "@/components/ui/button";

export interface UserCardProps {
  userId: string;
  displayName: string;
  bio?: string;
  isFollowing: boolean;
}

export function UserCard({ userId, displayName, bio, isFollowing }: UserCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="space-y-1">
        <h3 className="font-medium">{displayName}</h3>
        {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
      </div>
      <Button
        variant={isFollowing ? "outline" : "default"}
        onClick={() => {/* TODO: Implement follow/unfollow */}}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
} 