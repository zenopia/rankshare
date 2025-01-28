"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfileBase } from "@/components/users/user-profile-base";
import type { User } from "@/types/user";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

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
  showEditButton?: boolean;
}

export function UserProfile({
  username,
  fullName,
  bio,
  imageUrl,
  stats,
  isFollowing,
  hideFollow = false,
  userData,
  showEditButton = false
}: UserProfileProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const showMoreButton = false;
  const { signOut } = useClerk();

  // Split fullName into firstName and lastName for the base component
  const [firstName, lastName] = fullName.split(' ');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="space-y-6">
      <UserProfileBase
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
        showEditButton={showEditButton}
        extraButtons={showEditButton ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        ) : undefined}
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