'use client';

import type { List, ItemProperty } from "@/types/list";
import { ItemCard } from "@/components/items/item-card";
import { Link2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/lists/category-badge";

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
  item
}: ItemViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <Link href={`/lists/${list.id}`}>
        <Button
          variant="ghost"
          className="mb-6 -ml-2 h-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
      </Link>

      <div className="space-y-6">
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
    </div>
  );
} 