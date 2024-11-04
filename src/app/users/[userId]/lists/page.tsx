import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { UserModel } from "@/lib/db/models/user";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { DashboardSearchForm } from "@/components/search/dashboard-search-form";
import { FollowButton } from "@/components/users/follow-button";
import { serializeLists } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { MongoListDocument } from "@/types/mongodb";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: 'newest' | 'oldest' | 'most-viewed';
}

export default async function UserListsPage({
  params,
  searchParams,
}: {
  params: { userId: string };
  searchParams: SearchParams;
}) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) return null;

  await dbConnect();

  // Get user
  const user = await UserModel.findOne({ clerkId: params.userId }).lean() as { username: string } | null;
  if (!user) notFound();

  // Check if following
  const follow = await FollowModel.findOne({
    followerId: currentUserId,
    followingId: params.userId,
  }).lean();

  // Build filter
  const filter: any = { 
    ownerId: params.userId,
    privacy: 'public',
  };
  
  if (searchParams.q) {
    filter.$or = [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { 'items.title': { $regex: searchParams.q, $options: 'i' } },
      { 'items.comment': { $regex: searchParams.q, $options: 'i' } },
    ];
  }

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Fetch lists
  const lists = await ListModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .exec() as unknown as MongoListDocument[];

  const serializedLists = serializeLists(lists);

  // Update last checked time if following
  if (follow && !Array.isArray(follow)) {
    await FollowModel.updateOne(
      { _id: follow._id },
      { $set: { lastCheckedAt: new Date() } }
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user?.username || 'User'}'s Lists</h1>
            <p className="text-muted-foreground">Public lists</p>
          </div>
          <FollowButton 
            userId={params.userId}
            isFollowing={!!follow}
          />
        </div>
        <DashboardSearchForm 
          defaultValues={{
            q: searchParams.q,
            category: searchParams.category,
            sort: searchParams.sort,
          }}
        />
      </div>

      {serializedLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serializedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
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