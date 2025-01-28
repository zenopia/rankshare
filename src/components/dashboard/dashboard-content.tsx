"use client";

import { ListCard } from "@/components/lists/list-card";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import type { EnhancedList } from "@/types/list";

interface DashboardContentProps {
  recentLists: EnhancedList[];
  pinnedLists: EnhancedList[];
  userId: string;
}

export function DashboardContent({ 
  recentLists = [], 
  pinnedLists = [], 
  userId 
}: DashboardContentProps) {
  return (
    <div className="grid gap-8">
      {/* Pinned Lists */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Pinned Lists</h2>
        {!pinnedLists?.length ? (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="pin" />
            <EmptyPlaceholder.Title>No pinned lists</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Pin lists to access them quickly.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Lists */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Lists</h2>
        {!recentLists?.length ? (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="list" />
            <EmptyPlaceholder.Title>No lists created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any lists yet. Start creating one.
            </EmptyPlaceholder.Description>
            <EmptyPlaceholder.Action href="/lists/new">
              Create your first list
            </EmptyPlaceholder.Action>
          </EmptyPlaceholder>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 