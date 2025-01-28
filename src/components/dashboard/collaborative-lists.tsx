"use client";

import { useUser } from "@clerk/nextjs";
import { ListCard } from "@/components/lists/list-card";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { useCollaborativeLists } from "@/hooks/use-collaborative-lists";

export function CollaborativeLists() {
  const { user } = useUser();
  const { lists, isLoading } = useCollaborativeLists();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Collaborations</h2>
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
        <EmptyPlaceholder.Icon name="users" />
        <EmptyPlaceholder.Title>No collaborations</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You&apos;re not collaborating on any lists yet.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Collaborations</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
} 