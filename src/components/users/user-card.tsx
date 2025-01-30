"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { UserProfileBase } from "./user-profile-base";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface UserCardProps {
  username: string;
  displayName: string;
  imageUrl: string;
  isFollowing?: boolean;
  hideFollow?: boolean;
}

function UserCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card animate-pulse">
      <div className="flex items-center gap-3 min-w-0">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function UserCard({ username, displayName, imageUrl, isFollowing: initialIsFollowing = false, hideFollow = false }: UserCardProps) {
  const { isSignedIn, getToken, isLoaded, isReady } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  const pathname = usePathname();
  const usernameWithAt = username.startsWith('@') ? username : `@${username}`;

  // Only show skeleton after a delay if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded || !isReady) {
        setShouldShowSkeleton(true);
      }
    }, 200); // Small delay to prevent flash

    return () => clearTimeout(timer);
  }, [isLoaded, isReady]);

  // Check follow status when component mounts and auth is ready
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!isSignedIn || !isReady) {
        return;
      }
      
      try {
        const token = await getToken();
        const response = await fetch(`/api/users/${username}/follow/status`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
        // Fall back to prop value if API call fails
        setIsFollowing(initialIsFollowing);
      }
    };

    if (isSignedIn && isReady) {
      checkFollowStatus();
    } else {
      setIsFollowing(initialIsFollowing);
    }
  }, [username, isSignedIn, isReady, getToken, initialIsFollowing]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation(); // Stop event from bubbling up

    if (!isSignedIn) {
      toast.error("Please sign in to follow users");
      return;
    }

    if (!isReady) {
      toast.error("Please wait while we complete authentication");
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(isFollowing ? "Failed to unfollow user" : "Failed to follow user");
      }

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Successfully unfollowed user" : "Successfully followed user");
    } catch (error) {
      console.error(isFollowing ? "Error unfollowing user:" : "Error following user:", error);
      toast.error(isFollowing ? "Failed to unfollow user" : "Failed to follow user");
    } finally {
      setIsLoading(false);
    }
  };

  // Show skeleton only after delay and if still loading
  if (shouldShowSkeleton && (!isLoaded || !isReady)) {
    return <UserCardSkeleton />;
  }

  // Show nothing during initial load to prevent flash
  if (!isLoaded || !isReady) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <Link 
        href={`/profile/${usernameWithAt}?from=${pathname.startsWith('/') ? pathname.slice(1) : pathname}`}
        className="flex items-center gap-3 min-w-0"
      >
        <UserProfileBase
          username={username}
          firstName={displayName}
          imageUrl={imageUrl}
          variant="compact"
          hideFollow={true}
          linkToProfile={false}
        />
      </Link>
      {!hideFollow && isSignedIn && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          className="flex-shrink-0"
          onClick={handleFollowClick}
          disabled={isLoading || !isReady}
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
} 