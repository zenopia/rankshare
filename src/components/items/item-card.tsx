'use client';

import Link from "next/link";
import type { ItemProperty } from "@/types/list";

interface ItemCardProps {
  listId: string;
  item: {
    rank: number;
    title: string;
    comment?: string;
    properties?: ItemProperty[];
  };
  clickable?: boolean;
}

export function ItemCard({ listId, item, clickable = true }: ItemCardProps) {
  const content = (
    <div className="flex items-start gap-4">
      <span className="text-2xl font-bold text-muted-foreground">
        {item.rank}
      </span>
      <div>
        <h3 className="font-semibold">{item.title}</h3>
        {item.comment && (
          <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link 
        href={`/lists/${listId}/items/${item.rank}`}
        className="block p-4 bg-card rounded-lg border hover:border-primary transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg border">
      {content}
    </div>
  );
} 