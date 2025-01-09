"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/users/follow-button";
import Link from "next/link";
import useSWR from "swr";

interface UserCardProps {
  userId: string;
  isFollowing: boolean;
  hideFollow?: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

export function UserCard({ 
  userId, 
  isFollowing, 
  hideFollow,
}: UserCardProps) {
  const { data: user, error } = useSWR<UserProfile>(`/api/users/${userId}`);

  if (error || !user) return null;

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ');
  
  const displayName = fullName || user.username || '';

  return (
    <div className="overflow-hidden rounded-lg border bg-card hover:border-primary transition-colors">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link href={`/@${user.username}`} className="hover:underline">
              <h3 className="font-semibold truncate">{displayName}</h3>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            </Link>
          </div>
          {!hideFollow && (
            <FollowButton
              userId={userId}
              isFollowing={isFollowing}
            />
          )}
        </div>
      </div>
    </div>
  );
} 