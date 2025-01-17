import { notFound } from "next/navigation";
import mongoose from 'mongoose';
import { auth } from "@clerk/nextjs/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import type { MongoListDocument } from "@/types/mongo";
import { ListView } from "@/components/lists/list-view";
import { serializeList } from "@/lib/utils";
import { SubLayout } from "@/components/layout/sub-layout";

interface ListPageProps {
  params: {
    id: string;
  };
}

export default async function ListPage({ params }: ListPageProps) {
  try {
    const { userId } = auth();
    const ListModel = await getListModel();
    const PinModel = await getPinModel();
    const FollowModel = await getFollowModel();

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      notFound();
    }

    // Get list
    const list = await ListModel.findById(
      new mongoose.Types.ObjectId(params.id)
    ).lean() as unknown as MongoListDocument;

    if (!list) {
      notFound();
    }

    // Get additional data
    const [isPinned, isFollowing] = await Promise.all([
      userId ? PinModel.exists({ clerkId: userId, listId: list._id }) : false,
      userId ? FollowModel.exists({ followerId: userId, followingId: list.owner.clerkId }) : false
    ]);

    const isOwner = userId === list.owner.clerkId;
    const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');

    return (
      <SubLayout title={list.title}>
        <ListView 
          list={serializeList(list)}
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