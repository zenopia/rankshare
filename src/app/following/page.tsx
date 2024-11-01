import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import Link from "next/link";
import type { List } from "@/types/list";

export default async function FollowingPage() {
  const { userId } = await auth();
  let followedUsers: { id: string; name: string; listsCount: number }[] = [];
  let recentLists: (List & { hasUpdate?: boolean })[] = [];

  if (userId) {
    try {
      await dbConnect();

      // Get all users the current user follows
      const follows = await FollowModel.find({ followerId: userId }).lean();
      const followingIds = follows.map(f => f.followingId);

      // Get recent public lists from followed users
      const lists = await ListModel
        .find({
          ownerId: { $in: followingIds },
          privacy: 'public',
        })
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

      // Map lists with update status
      recentLists = lists.map(list => {
        const follow = follows.find(f => f.followingId === list.ownerId);
        const hasUpdate = follow ? new Date(list.updatedAt) > new Date(follow.lastCheckedAt) : false;

        return {
          id: list._id.toString(),
          ownerId: list.ownerId,
          ownerName: list.ownerName || 'Anonymous',
          title: list.title,
          category: list.category,
          description: list.description,
          items: list.items,
          privacy: list.privacy,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
          viewCount: list.viewCount,
          hasUpdate,
        };
      });

      // Get stats for followed users
      const userStats = await ListModel.aggregate([
        {
          $match: {
            ownerId: { $in: followingIds },
            privacy: 'public',
          }
        },
        {
          $group: {
            _id: '$ownerId',
            name: { $first: '$ownerName' },
            listsCount: { $sum: 1 },
          }
        }
      ]);

      followedUsers = userStats.map(user => ({
        id: user._id,
        name: user.name,
        listsCount: user.listsCount,
      }));
    } catch (error) {
      console.error('Error fetching following data:', error);
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Following</h1>

      {followedUsers.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {followedUsers.map(user => (
              <div key={user.id} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.listsCount} public lists
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Recent Updates</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentLists.map((list) => (
              <ListCard 
                key={list.id} 
                list={list}
                hasUpdate={list.hasUpdate}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground">
          You're not following anyone yet. Find users you like and follow them to see their updates here!
        </p>
      )}
    </div>
  );
} 