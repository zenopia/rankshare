"use client";

import { useUser } from "@clerk/nextjs";
import { ListCard } from "@/components/lists/list-card";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { usePinnedLists } from "@/hooks/use-pinned-lists";

export function PinnedLists() {
  const { user } = useUser();
  const { lists, isLoading } = usePinnedLists();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Pinned Lists</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!lists?.length) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="pin" />
        <EmptyPlaceholder.Title>No pinned lists</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You haven&apos;t pinned any lists yet. Pin lists to access them quickly.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Pinned Lists</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
} 