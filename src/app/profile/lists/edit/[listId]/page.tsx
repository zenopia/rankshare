import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnhancedLists } from "@/lib/actions/lists";
import { SubLayout } from "@/components/layout/sub-layout";
import { ListFormContent } from "@/components/lists/list-form-content";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";

interface EditListPageProps {
  params: {
    listId: string;
  };
}

export default async function EditListPage({ params }: EditListPageProps) {
  const { userId } = auth();
  const { listId } = params;

  if (!userId) {
    redirect('/sign-in');
  }

  const { lists } = await getEnhancedLists({ _id: listId });
  const list = lists[0];

  if (!list) {
    redirect('/not-found');
  }

  // Only allow owner to edit
  if (list.owner.clerkId !== userId) {
    redirect('/unauthorized');
  }

  return (
    <SubLayout title="Edit List" hideBottomNav>
      <ErrorBoundaryWrapper>
        <ListFormContent mode="edit" defaultValues={list} />
      </ErrorBoundaryWrapper>
    </SubLayout>
  );
} 