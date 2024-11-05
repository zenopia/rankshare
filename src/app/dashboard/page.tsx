import { auth } from "@clerk/nextjs";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListChecks, Eye, Users, Bookmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MongoListDocument } from '@/types/mongodb';
import { ListCard } from "@/components/lists/list-card";
import { serializeLists } from "@/lib/utils";

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
  const serializedLists = serializeLists(recentActivity);

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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {serializedLists.map((list) => (
              <ListCard 
                key={list.id} 
                list={list}
                showPrivacyBadge
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 