"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LocationDisplay } from "@/components/profile/location-display";
import { Check } from "lucide-react";
import { toast } from "sonner";
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
  isFollowing: initialIsFollowing,
  hideFollow = false,
  userData
}: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);

  const handleFollowClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userData?.clerkId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error();

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={imageUrl || undefined} alt={fullName} />
          <AvatarFallback>{fullName[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate">{fullName}</h2>
          <p className="text-muted-foreground">@{username}</p>
  
          <div className="flex gap-4 mt-2">
            <Link href={`/@${username}/followers`} className="text-sm">
              <span className="font-semibold">{stats.followers}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </Link>
            <Link href={`/@${username}/following`} className="text-sm">
              <span className="font-semibold">{stats.following}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </Link>
            <div className="text-sm">
              <span className="font-semibold">{stats.lists}</span>{" "}
              <span className="text-muted-foreground">Lists</span>
            </div>
          </div>
        </div>
  
        {!hideFollow && (
          <Button 
            variant={isFollowing ? "outline" : "default"}
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

      {userData && <LocationDisplay user={userData} />}

      {bio && (
        <div className="relative">
          <p 
            className={cn(
              "text-sm text-muted-foreground whitespace-pre-wrap",
              !isBioExpanded && "line-clamp-5"
            )}
            ref={(el) => {
              if (el) {
                const hasOverflow = el.scrollHeight > el.clientHeight;
                setShowMoreButton(hasOverflow);
              }
            }}
          >
            {bio}
          </p>
          {showMoreButton && (
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
      )}
    </div>
  );
} 