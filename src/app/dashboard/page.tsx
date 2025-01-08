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

    // Return a simpler version first to test
    return (
      <div className="px-4 md:px-6 lg:px-8 space-y-8 py-8 pb-20 sm:pb-8">
        <div>Dashboard is loading...</div>
        <pre>{JSON.stringify({ totalLists, totalViewCount, followerCount, pinnedCount }, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    // Return a fallback UI instead of throwing
    return (
      <div className="px-4 md:px-6 lg:px-8 py-8">
        <div className="text-red-500">
          Something went wrong loading the dashboard.
          {process.env.NODE_ENV === 'development' && (
            <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
          )}
        </div>
      </div>
    );
  }
} 