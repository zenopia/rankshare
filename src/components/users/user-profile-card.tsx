"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/users/follow-button";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface UserProfileCardProps {
  userId: string;
  isFollowing: boolean;
  hideFollow?: boolean;
  listCount?: number;
}

interface UserProfile {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

export function UserProfileCard({ 
  userId, 
  isFollowing, 
  hideFollow,
  listCount = 0
}: UserProfileCardProps) {
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
            <Link href={`/users/${userId}/lists`} className="hover:underline">
              <h3 className="font-semibold truncate">{displayName}</h3>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            </Link>
            {typeof listCount === 'number' && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <ListChecks className="h-4 w-4" />
                <span>{listCount}</span>
              </div>
            )}
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