"use client";

import useSWR from "swr";
import { UserProfileBase } from "@/components/users/user-profile-base";

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

  return (
    <UserProfileBase
      userId={userId}
      username={user.username}
      firstName={user.firstName}
      lastName={user.lastName}
      imageUrl={user.imageUrl}
      isFollowing={isFollowing}
      hideFollow={hideFollow}
      variant="card"
    />
  );
} 