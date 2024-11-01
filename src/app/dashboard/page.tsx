import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { DashboardSearchForm } from "@/components/search/dashboard-search-form";
import Link from "next/link";
import type { List } from "@/types/list";
import type { SortOrder } from 'mongoose';
import { FilterQuery } from 'mongoose';

interface DashboardPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: 'newest' | 'most-viewed';
    privacy?: 'public' | 'private';
  }> | {
    q?: string;
    category?: string;
    sort?: 'newest' | 'most-viewed';
    privacy?: 'public' | 'private';
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const { userId } = await auth();
  let lists: List[] = [];
  let totalLists = 0;
  let totalViews = 0;

  if (userId) {
    try {
      await dbConnect();
      
      // Build filter
      const filter: FilterQuery<List> = { ownerId: userId };
      
      if (resolvedParams.q) {
        filter.$or = [
          { title: { $regex: resolvedParams.q, $options: 'i' } },
          { 'items.title': { $regex: resolvedParams.q, $options: 'i' } },
          { 'items.comment': { $regex: resolvedParams.q, $options: 'i' } }
        ];
      }
      
      if (resolvedParams.category) {
        filter.category = resolvedParams.category;
      }
      
      if (resolvedParams.privacy) {
        filter.privacy = resolvedParams.privacy;
      }

      // Build sort
      const sortOptions: Record<string, Record<string, SortOrder>> = {
        'most-viewed': { viewCount: -1, createdAt: -1 },
        'newest': { createdAt: -1 }
      };

      const sort = sortOptions[resolvedParams.sort || 'newest'];

      // Get filtered lists
      const userLists = await ListModel
        .find(filter)
        .sort(sort)
        .limit(20)
        .lean();

      lists = userLists.map(list => ({
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
        viewCount: list.viewCount
      }));

      // Get stats (unfiltered)
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

      <div className="mb-8">
        <DashboardSearchForm 
          defaultValues={{
            q: resolvedParams.q,
            category: resolvedParams.category,
            sort: resolvedParams.sort,
            privacy: resolvedParams.privacy,
          }}
        />
      </div>

      <h2 className="text-2xl font-bold mb-4">My Lists</h2>
      {lists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list} 
              searchQuery={resolvedParams.q}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No lists found. Try adjusting your search or create your first list!
        </p>
      )}
    </div>
  );
} 