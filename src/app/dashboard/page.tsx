import { auth } from '@clerk/nextjs/server';
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListChecks, Eye, Users, Bookmark } from "lucide-react";

export default async function DashboardPage() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found');
      return null;
    }

    await dbConnect();
    console.log('DB connected, userId:', userId);

    // Fetch stats with error handling
    const stats = await Promise.all([
      ListModel.countDocuments({ ownerId: userId }).catch(e => {
        console.error('Error counting lists:', e);
        return 0;
      }),
      ListModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: { _id: null, total: { $sum: "$viewCount" } } }
      ]).catch(e => {
        console.error('Error aggregating views:', e);
        return [{ total: 0 }];
      }),
      FollowModel.countDocuments({ followingId: userId }).catch(e => {
        console.error('Error counting followers:', e);
        return 0;
      }),
      PinModel.countDocuments({ userId }).catch(e => {
        console.error('Error counting pins:', e);
        return 0;
      })
    ]);

    console.log('Stats fetched:', stats);

    const [totalLists, totalViews, followerCount, pinnedCount] = stats;
    const totalViewCount = totalViews[0]?.total || 0;

    return (
      <div className="px-4 md:px-6 lg:px-8 space-y-8 py-8 pb-20 sm:pb-8">
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
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    throw new Error(`Dashboard failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 