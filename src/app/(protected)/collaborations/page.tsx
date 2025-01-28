import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getCollaboratingLists } from "@/lib/actions/list.actions";
import ListCard from "@/components/lists/list-card";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CollaborationsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const lists = await getCollaboratingLists(user.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Collaborations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists?.map((list) => (
          <ListCard key={list._id.toString()} list={list} />
        ))}
        {lists?.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            You&apos;re not collaborating on any lists yet.
          </p>
        )}
      </div>
    </div>
  );
} 