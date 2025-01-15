import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SubLayout } from "@/components/layout/sub-layout";
import { ListForm } from "@/components/lists/list-form";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";
import { MongoListDocument } from "@/types/mongo";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditListPage({ params }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  await connectToMongoDB();
  const ListModel = await getListModel();

  const list = await ListModel.findById(params.id).lean() as unknown as MongoListDocument;
  if (!list) {
    notFound();
  }

  // Check if user is owner or collaborator
  const isOwner = list.owner.clerkId === userId;
  const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');
  
  if (!isOwner && !isCollaborator) {
    notFound();
  }

  const serializedList = {
    id: list._id.toString(),
    title: list.title,
    description: list.description || '',
    category: list.category,
    privacy: list.privacy,
    items: list.items.map(item => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description || '',
      properties: item.properties || []
    }))
  };

  return (
    <SubLayout title="Edit List">
      <div className="px-0 md:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <ListForm 
            mode="edit"
            defaultValues={serializedList}
          />
        </div>
      </div>
    </SubLayout>
  );
} 