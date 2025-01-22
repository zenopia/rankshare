"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FollowButton({ 
  userId, 
  isFollowing: initialIsFollowing,
  variant = "default",
  size = "default"
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleFollowClick = async () => {
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/sign-in?redirect_url=${returnUrl}`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: initialIsFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to follow/unfollow user");
      }

      const data = await response.json();
      toast.success(data.message);
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={initialIsFollowing ? "outline" : variant}
      size={size}
      onClick={handleFollowClick}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : (initialIsFollowing ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Following
        </>
      ) : 'Follow')}
    </Button>
  );
} 