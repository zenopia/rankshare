"use client";

import { useState } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { UserProfileBase } from "./user-profile-base";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface UserCardProps {
  username: string;
  firstName?: string;
  lastName?: string;
  imageUrl: string;
  isFollowing?: boolean;
  hideFollow?: boolean;
}

export function UserCard({ username, firstName, lastName, imageUrl, isFollowing: initialIsFollowing = false, hideFollow = false }: UserCardProps) {
  const { isSignedIn, getToken } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const pathname = usePathname();

  const handleFollowClick = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to follow users");
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      setIsFollowing(true);
      toast.success("Successfully followed user");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <UserProfileBase
          username={username}
          firstName={firstName}
          lastName={lastName}
          imageUrl={imageUrl}
          variant="compact"
          hideFollow={true}
          linkToProfile={false}
        />
      </div>
      {!hideFollow && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className="flex-shrink-0"
          onClick={handleFollowClick}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (isFollowing ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Following
            </>
          ) : 'Follow')}
        </Button>
      )}
    </div>
  );

  if (pathname) {
    const relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    return <Link href={`/${username}?from=${relativePath}`}>{content}</Link>;
  }

  return content;
} 