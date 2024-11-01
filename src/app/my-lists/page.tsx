import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ListCard } from "@/components/lists/list-card";
import { DashboardSearchForm } from "@/components/search/dashboard-search-form";
import Link from "next/link";
import type { List } from "@/types/list";
import type { SortOrder } from 'mongoose';
import { FilterQuery } from 'mongoose';

interface MyListsPageProps {
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

export default async function MyListsPage({ searchParams }: MyListsPageProps) {
  const resolvedParams = await searchParams;
  const { userId } = await auth();
  let lists: List[] = [];

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
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Lists</h1>
        <Link 
          href="/lists/create"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Create List
        </Link>
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