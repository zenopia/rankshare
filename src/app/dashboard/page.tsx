import { auth } from "@clerk/nextjs";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListChecks, Eye, Users, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { MongoListDocument } from '@/types/mongodb';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await dbConnect();

  // Fetch stats
  const [
    totalLists,
    totalViews,
    followerCount,
    pinnedCount,
    recentActivity
  ] = await Promise.all([
    ListModel.countDocuments({ ownerId: userId }),
    ListModel.aggregate([
      { $match: { ownerId: userId } },
      { $group: { _id: null, total: { $sum: "$viewCount" } } }
    ]),
    FollowModel.countDocuments({ followingId: userId }),
    PinModel.countDocuments({ userId }),
    ListModel.find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean()
      .exec() as unknown as MongoListDocument[]
  ]);

  const totalViewCount = totalViews[0]?.total || 0;

  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Lists"
          value={totalLists}
          icon={ListChecks}
        />
        <StatCard
          title="Total Views"
          value={totalViewCount}
          icon={Eye}
        />
        <StatCard
          title="Followers"
          value={followerCount}
          icon={Users}
        />
        <StatCard
          title="Pinned Lists"
          value={pinnedCount}
          icon={Bookmark}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((list) => (
              <div
                key={list._id?.toString()}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{list.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {list.privacy === "private" ? "Private" : `${list.viewCount} views`}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(list.updatedAt || ''), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 