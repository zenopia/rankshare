import { auth } from "@clerk/nextjs/server";
import { ListForm } from "@/components/lists/list-form";
import { ensureUserExists } from "@/lib/actions/user";

export default async function CreateListPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureUserExists();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create List</h1>
        <p className="text-muted-foreground">
          Create a new ranked list to share with others
        </p>
      </div>

      <ListForm />
    </div>
  );
} 