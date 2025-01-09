import { auth } from "@clerk/nextjs/server";
import { ListForm } from "@/components/lists/list-form";
import { ensureUserExists } from "@/lib/actions/user";
import { SubLayout } from "@/components/layout/sub-layout";

export default async function CreateListPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureUserExists();

  return (
    <SubLayout title="Create New List">
      <div className="px-4 md:px-6 lg:px-8 py-8">
        <ListForm />
      </div>
    </SubLayout>
  );
} 