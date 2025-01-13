"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfileBase } from "@/components/users/user-profile-base";
import type { User } from "@/types/user";

interface UserProfileProps {
  username: string;
  fullName: string;
  bio?: string | null;
  imageUrl?: string | null;
  stats: {
    followers: number;
    following: number;
    lists: number;
  };
  isFollowing: boolean;
  hideFollow?: boolean;
  userData?: Partial<User>;
}

export function UserProfile({
  username,
  fullName,
  bio,
  imageUrl,
  stats,
  isFollowing,
  hideFollow = false,
  userData
}: UserProfileProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const showMoreButton = false;

  // Split fullName into firstName and lastName for the base component
  const [firstName, lastName] = fullName.split(' ');

  return (
    <div className="space-y-6">
      <UserProfileBase
        userId={userData?.clerkId || ""}
        username={username}
        firstName={firstName}
        lastName={lastName}
        imageUrl={imageUrl}
        bio={bio}
        location={userData?.location}
        dateOfBirth={userData?.dateOfBirth}
        gender={userData?.gender}
        livingStatus={userData?.livingStatus}
        privacySettings={userData?.privacySettings}
        variant="full"
        hideFollow={hideFollow}
        isFollowing={isFollowing}
        showLocation={true}
        showStats={true}
        stats={stats}
        linkToProfile={false}
      />

      {bio && showMoreButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsBioExpanded(!isBioExpanded)}
          className="mt-1"
        >
          {isBioExpanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
} 