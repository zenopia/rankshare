import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getListModel } from "@/lib/db/models-v2/list";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { connectToDatabase } from "@/lib/db/mongodb";
import { redirect } from "next/navigation";

// Force dynamic rendering and prevent static optimization
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function DashboardContent({ totalLists, totalFollowers, totalFollowing }: { 
  totalLists: number;
  totalFollowers: number;
  totalFollowing: number;
}) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLists}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFollowers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Following</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFollowing}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    await connectToDatabase();
    const UserModel = await getUserModel();
    const ListModel = await getListModel();
    const FollowModel = await getFollowModel();

    // Get user stats
    const [totalLists, totalFollowers, totalFollowing] = await Promise.all([
      ListModel.countDocuments({ 'owner.clerkId': userId }),
      FollowModel.countDocuments({ followingId: userId, status: 'accepted' }),
      FollowModel.countDocuments({ followerId: userId, status: 'accepted' })
    ]);

    return (
      <MainLayout>
        <DashboardContent 
          totalLists={totalLists}
          totalFollowers={totalFollowers}
          totalFollowing={totalFollowing}
        />
      </MainLayout>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <MainLayout>
        <DashboardContent 
          totalLists={0}
          totalFollowers={0}
          totalFollowing={0}
        />
      </MainLayout>
    );
  }
} 