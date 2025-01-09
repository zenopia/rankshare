'use client';

import type { List, ItemProperty, ItemDetails } from "@/types/list";
import { ItemCard } from "@/components/items/item-card";
import { Link2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/lists/category-badge";
import { toast } from "sonner";
import { ItemDetailsOverlay } from "@/components/lists/item-details-overlay";
import { useState } from "react";

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
  isOwner
}: ItemViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsUpdate = async (details: ItemDetails) => {
    try {
      const response = await fetch(`/api/lists/${list.id}/items/${item.rank}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      toast.success('Item updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-0">

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {list.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CategoryBadge 
                category={list.category}
                className="pointer-events-none"
              />
              {list.privacy === 'private' && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {list.description && (
            <p className="text-muted-foreground text-sm">{list.description}</p>
          )}
        </div>

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
          
          {/* Updated custom properties styling */}
          {item.properties && item.properties.length > 0 && (
            <div className="divide-y divide-border">
              {item.properties.map(prop => (
                <div key={prop.id} className="py-4">
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

      {isOwner && (
        <>
          <Button
            variant="outline"
            onClick={() => setShowDetails(true)}
            className="mt-4"
          >
            Edit Details
          </Button>

          <ItemDetailsOverlay
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            onSave={handleDetailsUpdate}
            initialDetails={{
              title: item.title,
              comment: item.comment,
              properties: item.properties || []
            }}
          />
        </>
      )}
    </div>
  );
} 