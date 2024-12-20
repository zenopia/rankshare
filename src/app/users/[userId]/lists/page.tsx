import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { SearchInput } from "@/components/search/search-input";
import { ListCard } from "@/components/lists/list-card";
import { serializeLists } from "@/lib/utils";
import { UserProfileCard } from "@/components/users/user-profile-card";
import type { ListDocument } from "@/types/list";

interface SearchParams {
  q?: string;
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

  // Get user's public lists
  const [lists, followStatus] = await Promise.all([
    ListModel.find({ 
      ownerId: params.userId,
      privacy: 'public',
    })
      .sort({ createdAt: -1 })
      .lean() as unknown as ListDocument[],
    currentUserId ? FollowModel.findOne({ 
      followerId: currentUserId,
      followingId: params.userId 
    }) : null
  ]);

  const serializedLists = serializeLists(lists);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <UserProfileCard 
          userId={params.userId}
          isFollowing={!!followStatus}
          hideFollow={currentUserId === params.userId}
          listCount={lists.length}
        />
      </div>

      <div className="mb-8">
        <div className="max-w-md">
          <SearchInput 
            placeholder="Search lists..." 
            defaultValue={searchParams.q}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {serializedLists
          .filter(list => 
            !searchParams.q || 
            list.title.toLowerCase().includes(searchParams.q.toLowerCase())
          )
          .map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showPrivacyBadge
            />
          ))}
      </div>
    </div>
  );
} 