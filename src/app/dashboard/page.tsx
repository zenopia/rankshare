import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  let totalLists = 0;
  let totalViews = 0;

  if (userId) {
    try {
      await dbConnect();

      // Get stats
      totalLists = await ListModel.countDocuments({ ownerId: userId });
      const stats = await ListModel.aggregate([
        { $match: { ownerId: userId } },
        { $group: {
          _id: null,
          totalViews: { $sum: "$viewCount" },
        }}
      ]);
      
      if (stats.length > 0) {
        totalViews = stats[0].totalViews;
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Dashboard</h1>
        <Link 
          href="/lists/create"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Create List
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Lists</h3>
          <p className="text-3xl font-bold">{totalLists}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Views</h3>
          <p className="text-3xl font-bold">{totalViews}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link 
          href="/my-lists"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <h3 className="text-lg font-medium mb-2">My Lists</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all your lists
          </p>
        </Link>

        <Link 
          href="/saved"
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <h3 className="text-lg font-medium mb-2">Pinned Lists</h3>
          <p className="text-sm text-muted-foreground">
            Access your pinned lists
          </p>
        </Link>
      </div>
    </div>
  );
} 