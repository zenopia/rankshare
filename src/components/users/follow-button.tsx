"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useRouter } from "next/navigation";

export interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FollowButton({ 
  username, 
  isFollowing: initialIsFollowing,
  variant = "default",
  size = "default"
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { isSignedIn, getToken } = useAuthGuard();
  const router = useRouter();

  const handleFollowClick = async () => {
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/sign-in?returnUrl=${returnUrl}`);
      return;
    }

    setIsLoading(true);
    try {
      // Get token with retry for mobile
      let token = await getToken();
      if (!token && /Mobile|Android|iPhone/i.test(window.navigator.userAgent)) {
        // Try one more time for mobile browsers
        await new Promise(resolve => setTimeout(resolve, 100));
        token = await getToken();
      }
      
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to follow/unfollow user");
      }

      const data = await response.json();
      toast.success(data.message);
      
      // Update state locally instead of reloading
      setIsFollowing(!isFollowing);
      // Refresh router data without full page reload
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={isFollowing ? "outline" : variant}
      size={size}
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
  );
} 