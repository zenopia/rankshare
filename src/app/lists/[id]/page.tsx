import { notFound } from "next/navigation";
import mongoose from 'mongoose';
import { auth } from "@clerk/nextjs/server";
import { ListCollaborator } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { ListPageContent } from "./list-page-content";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface ListPageProps {
  params: {
    id: string;
  };
  searchParams: {
    from?: string;
  };
}

export default async function ListPage({ params, searchParams }: ListPageProps) {
  try {
    const { userId } = auth();
    const PinModel = await getPinModel();
    const FollowModel = await getFollowModel();

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      notFound();
    }

    // Get list and increment view count
    const response = await fetch(`/api/lists/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId || '', // Add user ID for view tracking
      },
      cache: 'no-store',
    });

    if (response.status === 403) {
      return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Private List</h1>
            <p className="text-muted-foreground">
              This list is private. You need to be the owner or a collaborator to view it.
            </p>
          </Card>
        </div>
      );
    }

    if (!response.ok) {
      notFound();
    }

    const list = await response.json();

    // Get additional data
    const [isPinned, isFollowing] = await Promise.all([
      userId ? PinModel.exists({ clerkId: userId, listId: new mongoose.Types.ObjectId(list.id) }) : false,
      userId ? FollowModel.exists({ followerId: userId, followingId: list.owner.clerkId }) : false
    ]);

    const isOwner = userId === list.owner.clerkId;
    const isCollaborator = list.collaborators?.some((c: ListCollaborator) => c.clerkId === userId && c.status === 'accepted');

    // If the list is private, only allow owner and collaborators to view it
    if (list.privacy === 'private' && !isOwner && !isCollaborator) {
      return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Private List</h1>
            <p className="text-muted-foreground">
              This list is private. You need to be the owner or a collaborator to view it.
            </p>
          </Card>
        </div>
      );
    }

    return (
      <ListPageContent
        list={list}
        isOwner={isOwner}
        isPinned={!!isPinned}
        isFollowing={!!isFollowing}
        isCollaborator={isCollaborator}
        returnPath={searchParams.from}
      />
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 