'use client';

import type { List, ItemProperty } from "@/types/list";
import { ItemCard } from "@/components/items/item-card";
import { ListHeader } from "@/components/lists/list-header";
import { Link2 } from "lucide-react";

interface ItemViewProps {
  list: List;
  item: {
    title: string;
    comment?: string;
    link?: string;
    rank: number;
    _id: string;
    properties?: ItemProperty[];
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

      <div className="mt-8 space-y-4">
        <ItemCard
          listId={list.id}
          item={{
            rank: item.rank,
            title: item.title,
            comment: item.comment,
            properties: item.properties
          }}
          clickable={false}
        />
        
        {/* Show custom properties */}
        {item.properties && item.properties.length > 0 && (
          <div className="space-y-4">
            {item.properties.map(prop => (
              <div key={prop.id} className="p-4 bg-card rounded-lg border">
                <h3 className="font-medium mb-2">{prop.label}</h3>
                {prop.type === 'link' ? (
                  <a 
                    href={prop.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all inline-flex items-center gap-1"
                  >
                    {prop.value}
                    <Link2 className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{prop.value}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 