'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/users/follow-button";
import Link from "next/link";

interface AuthorCardProps {
  authorId: string;
  name: string;
  username: string;
  imageUrl?: string;
  isFollowing: boolean;
  hideFollow?: boolean;
  listCount?: number;
}

export function AuthorCard({ 
  authorId, 
  name, 
  username, 
  imageUrl, 
  isFollowing, 
  hideFollow,
  listCount
}: AuthorCardProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-6">
      <Link href={`/users/${authorId}/lists`} className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-medium leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">@{username}</p>
          {typeof listCount === 'number' && (
            <p className="text-sm text-muted-foreground">
              {listCount} public {listCount === 1 ? 'list' : 'lists'}
            </p>
          )}
        </div>
      </Link>
      {!hideFollow && (
        <FollowButton
          userId={authorId}
          isFollowing={isFollowing}
        />
      )}
    </div>
  );
}