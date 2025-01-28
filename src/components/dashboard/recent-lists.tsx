import { auth } from "@clerk/nextjs/server";
import { ListCard } from "@/components/lists/list-card";
import { EmptyPlaceholder } from "@/components/ui/empty-placeholder";
import { getRecentLists } from "@/lib/actions/lists";

export async function RecentLists() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const { lists } = await getRecentLists(userId);

  if (!lists?.length) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Recent Lists</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
} 