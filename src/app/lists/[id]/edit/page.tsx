import { Suspense } from 'react';
import { notFound } from "next/navigation";
import { ListForm } from "@/components/lists/list-form";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { auth } from "@clerk/nextjs/server";
import type { List } from "@/types/list";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DeleteListButton } from "@/components/lists/delete-list-button";

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Edit List</h1>
            <DeleteListButton listId={list._id.toString()} />
          </div>
          <Suspense fallback={<div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>}>
            <ListForm initialData={initialData} mode="edit" />
          </Suspense>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 