import { auth } from "@clerk/nextjs";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import { UserModel } from "@/lib/db/models/user";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { FollowButton } from "@/components/users/follow-button";
import { serializeLists } from "@/lib/utils";
import type { MongoListDocument } from "@/types/mongodb";
import type { User } from "@/types/user";
import { Types } from "mongoose";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
}

interface MongoUserDocument extends Omit<User, '_id'> {
  _id: Types.ObjectId;
  __v?: number;
}

export default async function UserListsPage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: SearchParams;
}) {
  const { userId: currentUserId } = await auth();
  await dbConnect();

  // Get user with proper type casting
  const userDoc = await UserModel.findOne({ clerkId: params.userId }).lean() as MongoUserDocument;
  if (!userDoc) return null;

  // Cast the MongoDB document to our User type
  const user: User & { _id: string } = {
    _id: userDoc._id.toString(),
    clerkId: userDoc.clerkId,
    username: userDoc.username,
    email: userDoc.email,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };

  // Check if current user is following this user
  let isFollowing = false;
  if (currentUserId) {
    const follow = await FollowModel.findOne({
      followerId: currentUserId,
      followingId: params.userId,
    }).lean();
    isFollowing = !!follow;
  }

  // Build filter for public lists
  const filter: any = { 
    ownerId: params.userId, // Using the Clerk ID directly as it's stored as ownerId
    privacy: 'public',
  };
  
  if (searchParams.q) {
    filter.$or = [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } },
    ];
  }

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Fetch public lists
  const lists = await ListModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .exec() as unknown as MongoListDocument[];

  const serializedLists = serializeLists(lists);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{user.username}'s Lists</h1>
            <p className="text-muted-foreground">Public lists</p>
          </div>
          {currentUserId && currentUserId !== params.userId && (
            <FollowButton 
              userId={params.userId}
              isFollowing={isFollowing}
            />
          )}
        </div>
      </div>

      {serializedLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serializedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showPrivacyBadge
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground">
            No public lists found.
          </p>
        </div>
      )}
    </div>
  );
} 