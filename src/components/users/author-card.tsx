"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AuthorCardProps {
  authorId: string;
  name: string;
  username: string;
  isFollowing: boolean;
  hideFollow?: boolean;
  imageUrl?: string;
}

export function AuthorCard({ 
  authorId, 
  name, 
  username, 
  isFollowing: initialIsFollowing, 
  hideFollow,
  imageUrl 
}: AuthorCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleFollow = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${authorId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error();

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <Link 
        href={`/users/${authorId}/lists`}
        className="flex items-center gap-3"
      >
        <Image 
          src={imageUrl || "/images/default-avatar.png"}
          alt={name}
          width={48}
          height={48}
          className="rounded-full"
          priority
        />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{username}</p>
        </div>
      </Link>
      
      {!hideFollow && (
        <Button
          variant={isFollowing ? "secondary" : "default"}
          onClick={toggleFollow}
          disabled={isLoading}
          className="w-28"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
} 