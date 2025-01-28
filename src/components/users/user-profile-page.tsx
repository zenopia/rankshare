"use client";

import { EnhancedUser, followUser, unfollowUser } from "@/lib/actions/users-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils/date";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserProfilePageProps {
  user: {
    id: string;
    username: string | null;
    fullName: string | null;
    imageUrl: string;
  };
  profile: {
    id: string;
    bio?: string;
    location?: string;
    website?: string;
    joinedAt: Date;
  } | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export function UserProfilePage({ 
  user, 
  profile,
  followerCount,
  followingCount,
  isFollowing: initialIsFollowing
}: UserProfilePageProps) {
  const { userId } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const isOwnProfile = userId === user.id;
  const pathname = usePathname();

  const handleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.id);
        toast.success(`Unfollowed ${user.fullName || user.username}`);
      } else {
        await followUser(user.id);
        toast.success(`Following ${user.fullName || user.username}`);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.imageUrl} alt={user.fullName || user.username || ''} />
              <AvatarFallback>{(user.fullName || user.username || '?')[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              {profile?.bio && (
                <p className="mt-2 text-sm">{profile.bio}</p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                {profile?.location && (
                  <span>{profile.location}</span>
                )}
                {profile?.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website}
                  </a>
                )}
                {profile?.joinedAt && (
                  <span>Joined {formatDate(profile.joinedAt)}</span>
                )}
              </div>
            </div>
          </div>
          {!isOwnProfile && (
            <Button
              variant={isFollowing ? "secondary" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <Tabs defaultValue="lists" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="lists" className="flex-1" asChild>
              <Link href={`/@${user.username}`}>
                Lists
              </Link>
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1" asChild>
              <Link href={`/@${user.username}/followers`}>
                Followers
                <span className="ml-1 text-muted-foreground">
                  {followerCount}
                </span>
              </Link>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1" asChild>
              <Link href={`/@${user.username}/following`}>
                Following
                <span className="ml-1 text-muted-foreground">
                  {followingCount}
                </span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
    </div>
  );
} 