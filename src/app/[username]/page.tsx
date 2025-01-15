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
import type { MongoListDocument, MongoListFilter, MongoSortOptions } from "@/types/mongodb";
import { getUserModel } from "@/lib/db/models-v2/user";

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
  const { userId } = await auth();
  await connectToMongoDB();

  // Get model instances
  const UserModel = await getUserModel();
  const ListModel = await getListModel();
  const FollowModel = await getFollowModel();

  // Remove @ if present in the username parameter
  const username = params.username.replace(/^@/, '');

  // Get user from Clerk
  const users = await clerkClient.users.getUserList({
    username: [username],
  });
  const profileUser = users[0];
  
  if (!profileUser) {
    notFound();
  }

  // Get user data from MongoDB and other counts
  const [mongoUser, followStatus, followerCount, followingCount] = await Promise.all([
    UserModel.findOne({ clerkId: profileUser.id }).lean(),
    userId ? FollowModel.findOne({ 
      followerId: userId,
      followingId: profileUser.id 
    }) : null,
    FollowModel.countDocuments({ followingId: profileUser.id }),
    FollowModel.countDocuments({ followerId: profileUser.id }),
  ]);

  if (!mongoUser) {
    notFound();
  }

  const serializedUser = serializeUser(mongoUser as any);

  // Build filter for lists
  const filter: MongoListFilter = { 
    'owner.clerkId': profileUser.id,
    privacy: 'public',
  };

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Build sort
  const sort: MongoSortOptions = {};
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
              hideSearch
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
}