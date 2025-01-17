import { notFound } from "next/navigation";
import mongoose from 'mongoose';
import { auth } from "@clerk/nextjs/server";
import { ListCollaborator } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { ListView } from "@/components/lists/list-view";
import { SubLayout } from "@/components/layout/sub-layout";

interface ListPageProps {
  params: {
    id: string;
  };
}

export default async function ListPage({ params }: ListPageProps) {
  try {
    const { userId } = auth();
    const PinModel = await getPinModel();
    const FollowModel = await getFollowModel();

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      notFound();
    }

    // Get list and increment view count
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/lists/${params.id}`, {
      method: 'GET',
      headers: {
        'X-User-Id': userId || ''
      },
      cache: 'no-store'
    });

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

    return (
      <SubLayout title={list.title}>
        <ListView 
          list={list}
          isOwner={isOwner}
          isPinned={!!isPinned}
          isFollowing={!!isFollowing}
          isCollaborator={isCollaborator}
        />
      </SubLayout>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 