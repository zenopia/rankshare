import { notFound } from "next/navigation";
import { ListForm } from "@/components/lists/list-form";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { auth } from "@clerk/nextjs/server";
import type { List } from "@/types/list";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ListFormHeader } from "@/components/lists/list-form-header";
import { ErrorBoundary } from "@/components/error-boundary";

interface EditListPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditListPage({ params }: EditListPageProps) {
  try {
    const resolvedParams = await params;
    await dbConnect();
    
    const list = await ListModel.findById(resolvedParams.id).lean() as unknown as List & { _id: string };
    
    if (!list) {
      notFound();
    }

    // Check if the current user is the owner
    const { userId } = await auth();
    if (userId !== list.ownerId) {
      notFound();
    }

    const initialData = {
      id: list._id.toString(),
      title: list.title,
      category: list.category,
      description: list.description,
      privacy: list.privacy,
      items: list.items.map(item => ({
        id: crypto.randomUUID(),
        title: item.title,
        comment: item.comment,
      })),
    };

    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8">
          <ListFormHeader mode="edit" />
          <ErrorBoundary>
            <ListForm initialData={initialData} mode="edit" />
          </ErrorBoundary>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 