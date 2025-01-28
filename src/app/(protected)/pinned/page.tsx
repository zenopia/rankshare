import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getPinnedLists } from "@/lib/actions/list.actions";
import ListCard from "@/components/lists/list-card";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PinnedListsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const lists = await getPinnedLists(user.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pinned Lists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists?.map((list) => (
          <ListCard key={list._id.toString()} list={list} />
        ))}
        {lists?.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            You haven&apos;t pinned any lists yet.
          </p>
        )}
      </div>
    </div>
  );
} 