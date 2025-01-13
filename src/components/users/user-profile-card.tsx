"use client";

import useSWR from "swr";
import { UserProfileBase } from "@/components/users/user-profile-base";
import { ListChecks } from "lucide-react";

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

  return (
    <div className="overflow-hidden rounded-lg border bg-card hover:border-primary transition-colors">
      <div className="p-6">
        <UserProfileBase
          userId={userId}
          username={user.username}
          firstName={user.firstName}
          lastName={user.lastName}
          imageUrl={user.imageUrl}
          isFollowing={isFollowing}
          hideFollow={hideFollow}
          variant="card"
          linkToProfile={true}
        />
        {typeof listCount === 'number' && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <ListChecks className="h-4 w-4" />
            <span>{listCount}</span>
          </div>
        )}
      </div>
    </div>
  );
} 