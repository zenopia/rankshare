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
import { ensureUserExists } from "@/lib/actions/user";
import { notFound } from "next/navigation";

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
  try {
    const { userId: currentUserId } = await auth();
    await dbConnect();

    // Ensure current user exists in our DB if logged in
    if (currentUserId) {
      await ensureUserExists();
    }

    // Get user with proper type casting
    let userDoc = await UserModel.findOne({ clerkId: params.userId }).lean() as MongoUserDocument;
    
    // If the user doesn't exist in our DB, try to create them
    if (!userDoc) {
      // Find a list by this user to get their name
      const userList = await ListModel.findOne({ ownerId: params.userId }).lean() as MongoListDocument;
      if (userList) {
        // Create user document from list owner info
        const newUser = await UserModel.create({
          clerkId: params.userId,
          username: userList.ownerName,
          email: `user_${params.userId}@example.com`, // placeholder email
        });
        userDoc = newUser.toObject();
      } else {
        notFound();
      }
    }

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
      ownerId: params.userId,
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

    // Get total list count
    const totalListCount = await ListModel.countDocuments({ ownerId: params.userId });

    // Fetch public lists
    const lists = await ListModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec() as MongoListDocument[];

    const serializedLists = serializeLists(lists);

    return (
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground">
                {totalListCount} {totalListCount === 1 ? 'list' : 'lists'} • {serializedLists.length} public
              </p>
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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
  } catch (error) {
    notFound();
  }
} 