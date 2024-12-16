'use client';

import type { List } from "@/types/list";
import { ItemCard } from "@/components/items/item-card";
import { ListHeader } from "@/components/lists/list-header";

interface ItemViewProps {
  list: List;
  item: {
    title: string;
    comment?: string;
    link?: string;
    rank: number;
    _id: string;
  };
  isOwner: boolean;
  isFollowing: boolean;
  ownerUsername?: string;
  ownerName: string;
}

export function ItemView({ 
  list,
  item,
  isOwner,
  isFollowing,
  ownerUsername,
  ownerName
}: ItemViewProps) {
  return (
    <div className="container max-w-3xl py-8">
      <ListHeader 
        list={list}
        isOwner={isOwner}
        isFollowing={isFollowing}
        ownerUsername={ownerUsername}
        ownerName={ownerName}
      />

      <div className="mt-8">
        <ItemCard
          listId={list.id}
          item={item}
          clickable={false}
        />
        
        {/* Show link if it exists */}
        {item.link && (
          <div className="mt-4 p-4 bg-card rounded-lg border">
            <h3 className="font-medium mb-2">Link</h3>
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {item.link}
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 