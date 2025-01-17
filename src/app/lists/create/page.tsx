import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/actions/user";
import { SubLayout } from "@/components/layout/sub-layout";
import { ListFormContent } from "@/components/lists/list-form-content";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";

export default async function CreateListPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureUserExists();

  return (
    <SubLayout title="Create New List">
      <ErrorBoundaryWrapper>
        <ListFormContent mode="create" />
      </ErrorBoundaryWrapper>
    </SubLayout>
  );
} 