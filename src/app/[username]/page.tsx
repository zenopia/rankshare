import { SubLayout } from "@/components/layout/sub-layout";
import { UserProfile } from "@/components/users/user-profile";
import { ListSearchControls } from "@/components/lists/list-search-controls";
import { ListCard } from "@/components/lists/list-card";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { connectToMongoDB } from "@/lib/db/client";
import { serializeLists, serializeUser } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { ListCategory } from "@/types/list";
import type { MongoListDocument, MongoUserDocument } from "@/types/mongo";
import { getUserModel, type UserDocument } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { SortOrder, Document } from "mongoose";
import { FlattenMaps, Types } from "mongoose";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    q?: string;
    category?: ListCategory;
    sort?: string;
  };
}

export default async function UserPage({ params, searchParams }: PageProps) {
  try {
    const { userId } = await auth();

    // Remove @ if present and decode the username
    const username = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from Clerk first
    const users = await clerkClient.users.getUserList({
      limit: 100
    });
    console.log('Looking for user:', username);
    const profileUser = users.find(
      (user: { username: string | null }) => 
      user.username?.toLowerCase() === username.toLowerCase()
    );
    
    if (!profileUser) {
      console.error(`User not found: ${username}`);
      notFound();
    }

    // Connect to MongoDB after confirming user exists in Clerk
    try {
      await connectToMongoDB();
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }

    // Get model instances
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();
    const ListModel = await getListModel();
    const FollowModel = await getFollowModel();

    // Get user data from MongoDB
    let mongoUser = (await UserModel.findOne({ 
      clerkId: profileUser.id 
    }).lean()) as unknown as MongoUserDocument;

    if (!mongoUser) {
      // If user exists in Clerk but not in MongoDB, create them
      const newUser = await UserModel.create({
        clerkId: profileUser.id,
        username: profileUser.username || '',
        displayName: `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username || '',
        searchIndex: `${profileUser.username || ''} ${profileUser.firstName || ''} ${profileUser.lastName || ''}`.toLowerCase(),
        followersCount: 0,
        followingCount: 0,
        listCount: 0,
        privacySettings: {
          showDateOfBirth: false,
          showGender: true,
          showLivingStatus: true
        }
      });
      mongoUser = newUser.toObject() as unknown as MongoUserDocument;
    }

    // Get remaining data after we have mongoUser
    const [userProfile, followStatus, followerCount, followingCount] = await Promise.all([
      UserProfileModel.findOne({ userId: mongoUser._id }).lean(),
      userId ? FollowModel.findOne({ 
        followerId: userId,
        followingId: profileUser.id 
      }) : null,
      FollowModel.countDocuments({ followingId: profileUser.id }),
      FollowModel.countDocuments({ followerId: profileUser.id }),
    ]);

    const baseUser = serializeUser(mongoUser);
    const serializedUser = {
      ...baseUser,
      bio: userProfile?.bio,
      location: userProfile?.location,
      dateOfBirth: userProfile?.dateOfBirth,
      gender: userProfile?.gender,
      livingStatus: userProfile?.livingStatus,
      privacySettings: userProfile?.privacySettings || {
        showBio: true,
        showLocation: true,
        showDateOfBirth: false,
        showGender: true,
        showLivingStatus: true
      }
    };

    // Build filter for lists
    const filter = { 
      'owner.clerkId': profileUser.id,
      privacy: 'public',
      ...(searchParams.category ? { category: searchParams.category } : {})
    };

    // Build sort
    const sort: Record<string, SortOrder> = {};
    switch (searchParams.sort) {
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'most-viewed':
        sort['stats.viewCount'] = -1;
        break;
      case 'newest':
      default:
        sort.createdAt = -1;
    }

    // Get user's filtered public lists
    const lists = await ListModel.find(filter)
      .sort(sort)
      .lean() as unknown as MongoListDocument[];

    const serializedLists = serializeLists(lists);

    return (
      <SubLayout title={username}>
        <div className="px-0 md:px-6 lg:px-8 pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <UserProfile 
              username={profileUser.username || ""}
              fullName={`${profileUser.firstName || ""} ${profileUser.lastName || ""}`.trim()}
              bio={serializedUser?.bio || null}
              imageUrl={profileUser.imageUrl}
              stats={{
                followers: followerCount,
                following: followingCount,
                lists: serializedLists.length,
              }}
              isFollowing={!!followStatus}
              hideFollow={userId === profileUser.id}
              userData={serializedUser}
            />
            
            <div className="space-y-8">
              <ListSearchControls 
                defaultCategory={searchParams.category as ListCategory}
                defaultSort={searchParams.sort}
              />

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {serializedLists.map((list) => (
                  <ListCard 
                    key={list.id}
                    list={list}
                    showPrivacyBadge
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SubLayout>
    );
  } catch (error) {
    console.error("Error in UserPage:", error);
    notFound();
  }
}