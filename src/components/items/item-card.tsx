'use client';

import Link from "next/link";

interface ItemCardProps {
  listId: string;
  item: {
    rank: number;
    title: string;
    comment?: string;
  };
}

export function ItemCard({ listId, item }: ItemCardProps) {
  return (
    <Link 
      href={`/lists/${listId}/items/${item.rank}`}
      className="block p-4 bg-card rounded-lg border hover:border-primary transition-colors"
    >
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
    </Link>
  );
} 