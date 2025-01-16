import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SubLayout } from "@/components/layout/sub-layout";
import { ListView } from "@/components/lists/list-view";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { connectToMongoDB } from "@/lib/db/client";
import { MongoListDocument } from "@/types/mongo";
import { serializeLists } from "@/lib/utils";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ListPage({ params }: PageProps) {
  const { userId } = auth();

  await connectToMongoDB();
  const ListModel = await getListModel();
  const PinModel = await getPinModel();
  const FollowModel = await getFollowModel();

  // Get list
  const list = await ListModel.findById(params.id).lean() as unknown as MongoListDocument;
  if (!list) {
    notFound();
  }

  // Check if list is public or user has access
  if (list.privacy !== 'public') {
    if (!userId) {
      notFound();
    }

    const isOwner = list.owner.clerkId === userId;
    const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');

    if (!isOwner && !isCollaborator) {
      notFound();
    }
  }

  const isOwner = userId === list.owner.clerkId;
  const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');

  // Get pin status
  const isPinned = userId ? !!(await PinModel.findOne({ 
    clerkId: userId,
    listId: list._id
  })) : false;

  // Get follow status
  const isFollowing = userId ? !!(await FollowModel.findOne({
    followerId: userId,
    followingId: list.owner.clerkId,
    status: 'accepted'
  })) : false;

  // Serialize list
  const [serializedList] = serializeLists([list]);

  // Update view count
  await ListModel.updateOne(
    { _id: list._id },
    { $inc: { 'stats.viewCount': 1 } }
  );

  return (
    <SubLayout title={list.title}>
      <div className="px-0 md:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <ListView 
            list={serializedList}
            isOwner={isOwner}
            isPinned={isPinned}
            isFollowing={isFollowing}
            isCollaborator={isCollaborator}
          />
        </div>
      </div>
    </SubLayout>
  );
} 