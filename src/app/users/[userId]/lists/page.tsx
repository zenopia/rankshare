import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { SubLayout } from "@/components/layout/sub-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";
import { connectToMongoDB } from "@/lib/db/client";
import type { MongoUserDocument } from "@/types/mongo";
import { getEnhancedLists } from "@/lib/actions/lists";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
}

interface PageProps {
  params: {
    userId: string;
  };
  searchParams: SearchParams;
}

export default async function UserListsPage({ params, searchParams }: PageProps) {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  const UserModel = await getUserModel();

  // Get user
  const user = await UserModel.findOne({ clerkId: params.userId }).lean() as unknown as MongoUserDocument;
  if (!user) {
    notFound();
  }

  // Get current user
  const { userId: currentUserId } = auth();

  // Get follow status
  const isFollowing = currentUserId ? !!(await FollowModel.findOne({
    followerId: currentUserId,
    followingId: user.clerkId,
    status: 'accepted'
  })) : false;

  // Build base query
  const baseQuery = {
    'owner.clerkId': user.clerkId,
    privacy: 'public'
  };

  // Add search filter if query exists
  const searchFilter = searchParams.q ? {
    $or: [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } }
    ]
  } : {};

  // Add category filter if specified
  const categoryFilter = searchParams.category ? {
    category: searchParams.category
  } : {};

  // Combine all filters
  const filter = {
    ...baseQuery,
    ...searchFilter,
    ...categoryFilter
  };

  // Get enhanced lists with owner data and last viewed timestamps
  const { lists, lastViewedMap } = await getEnhancedLists(filter);

  // Sort lists
  const sortedLists = [...lists].sort((a, b) => {
    switch (searchParams.sort) {
      case 'views':
        return (b.stats.viewCount || 0) - (a.stats.viewCount || 0);
      case 'pins':
        return (b.stats.pinCount || 0) - (a.stats.pinCount || 0);
      case 'copies':
        return (b.stats.copyCount || 0) - (a.stats.copyCount || 0);
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <SubLayout title={`${user.username}'s Lists`}>
      <div className="px-0 md:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <ListGrid 
            lists={sortedLists}
            searchParams={searchParams}
            isFollowing={isFollowing}
            lastViewedMap={lastViewedMap}
          />
        </div>
      </div>
    </SubLayout>
  );
} 