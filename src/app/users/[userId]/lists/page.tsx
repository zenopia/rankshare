import { notFound } from "next/navigation";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { AuthorCard } from "@/components/users/author-card";
import { ListCard } from "@/components/lists/list-card";
import { serializeList } from "@/lib/utils";
import type { MongoListDocument } from "@/types/mongodb";
import type { ListDocument } from "@/types/list";

interface UserListsPageProps {
  params: {
    userId: string;
  };
}

export default async function UserListsPage({ params }: UserListsPageProps) {
  try {
    await dbConnect();
    const { userId: currentUserId } = await auth();

    // Get user data from Clerk
    const owner = await clerkClient.users.getUser(params.userId);
    if (!owner) {
      notFound();
    }

    const fullName = `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim();

    // Get follow status and counts
    const [followStatus, followerCount, publicListCount] = await Promise.all([
      currentUserId ? FollowModel.findOne({
        followerId: currentUserId,
        followingId: params.userId
      }) : null,
      FollowModel.countDocuments({ followingId: params.userId }),
      ListModel.countDocuments({ 
        ownerId: params.userId,
        privacy: 'public'
      })
    ]);

    // Get user's public lists
    const lists = await ListModel.find({ 
      ownerId: params.userId,
      privacy: 'public'
    }).sort({ createdAt: -1 }).lean() as MongoListDocument[];

    const serializedLists = lists.map(list => serializeList(list as ListDocument));

    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <AuthorCard
          authorId={params.userId}
          name={fullName || owner.username || ''}
          username={owner.username ?? ''}
          imageUrl={owner.imageUrl}
          isFollowing={!!followStatus}
          hideFollow={currentUserId === params.userId}
        />

        {/* Stats display */}
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground border-t pt-4">
          <div>
            <span className="font-medium text-foreground">{publicListCount}</span> Public Lists
          </div>
          <div>
            <span className="font-medium text-foreground">{followerCount}</span> Followers
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {serializedLists.map(list => (
            <ListCard 
              key={list.id} 
              list={list}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user lists:', error);
    notFound();
  }
} 