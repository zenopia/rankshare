'use client';

import { CategoryBadge } from "@/components/lists/category-badge";
import { AuthorCard } from "@/components/users/author-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { List } from "@/types/list";
import { ItemCard } from "@/components/items/item-card";

interface ItemViewProps {
  list: List;
  item: {
    rank: number;
    title: string;
    comment?: string;
  };
  isOwner: boolean;
  isFollowing: boolean;
  ownerUsername?: string | null;
  ownerName: string;
}

export function ItemView({ list, item, isOwner, isFollowing, ownerUsername, ownerName }: ItemViewProps) {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Link href={`/lists/${list.id}`} className="mb-6 block">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
      </Link>

      <AuthorCard
        authorId={list.ownerId}
        name={ownerName || list.ownerName}
        username={ownerUsername ?? list.ownerName}
        isFollowing={isFollowing}
        hideFollow={isOwner}
        imageUrl={list.ownerImageUrl}
      />

      <div className="mt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold sm:text-3xl truncate">
              {list.title}
            </h1>
            <CategoryBadge 
              category={list.category}
              className="flex-shrink-0"
            />
          </div>

          {list.description && (
            <p className="text-muted-foreground text-sm">{list.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <ItemCard 
            listId={list.id}
            item={item}
          />
        </div>
      </div>
    </div>
  );
} 