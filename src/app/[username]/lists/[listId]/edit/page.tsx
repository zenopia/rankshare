import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";
import type { ListDocument } from "@/lib/db/models-v2/list";
import type { ListCategory } from "@/types/list";
import { SubLayout } from "@/components/layout/sub-layout";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { ListFormContent } from "@/components/lists/list-form-content";

interface PageProps {
  params: {
    username: string;
    listId: string;
  };
  searchParams: {
    from?: string;
  };
}

export default async function EditListPage({ params, searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  await connectToMongoDB();
  const ListModel = await getListModel();

  const list = await ListModel.findOne({ _id: params.listId }).lean() as ListDocument & { _id: { toString(): string } };
  if (!list) {
    notFound();
  }

  // Check if user is owner or collaborator
  const isOwner = list.owner.clerkId === userId;
  const isCollaborator = list.collaborators?.some(c => 
    c.clerkId === userId && 
    c.status === 'accepted' && 
    ['admin', 'editor'].includes(c.role)
  );
  
  if (!isOwner && !isCollaborator) {
    notFound();
  }

  // Validate that the category is a valid ListCategory
  if (!['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'].includes(list.category)) {
    list.category = 'other';
  }

  const serializedList = {
    id: list._id.toString(),
    title: list.title,
    description: list.description || '',
    category: list.category as ListCategory,
    privacy: list.privacy,
    items: list.items.map(item => ({
      id: Math.random().toString(36).slice(2),
      title: item.title,
      comment: item.comment,
      properties: item.properties?.map(prop => ({
        id: Math.random().toString(36).slice(2),
        type: prop.type,
        label: prop.label,
        value: prop.value
      }))
    })),
    listType: list.listType || 'ordered',
    owner: {
      id: list.owner.userId.toString(),
      clerkId: list.owner.clerkId,
      username: params.username,
      joinedAt: new Date().toISOString(),
      displayName: '',
      imageUrl: null
    },
    stats: list.stats,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    editedAt: list.editedAt?.toISOString()
  };

  return (
    <SubLayout title="Edit List" hideBottomNav>
      <ErrorBoundaryWrapper>
        <ListFormContent 
          mode="edit"
          defaultValues={serializedList}
          returnPath={searchParams.from}
        />
      </ErrorBoundaryWrapper>
    </SubLayout>
  );
} 