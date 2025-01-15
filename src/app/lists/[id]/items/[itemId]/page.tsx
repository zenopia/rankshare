import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SubLayout } from "@/components/layout/sub-layout";
import { ItemForm } from "@/components/lists/item-form";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";
import { MongoListDocument } from "@/types/mongo";

interface PageProps {
  params: {
    id: string;
    itemId: string;
  };
}

export default async function EditItemPage({ params }: PageProps) {
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

  const item = list.items.find(item => item._id.toString() === params.itemId);
  if (!item) {
    notFound();
  }

  const serializedItem = {
    id: item._id.toString(),
    title: item.title,
    description: item.description || '',
    properties: item.properties || []
  };

  return (
    <SubLayout title="Edit Item">
      <div className="px-0 md:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <ItemForm 
            mode="edit"
            defaultValues={serializedItem}
            listId={params.id}
          />
        </div>
      </div>
    </SubLayout>
  );
} 