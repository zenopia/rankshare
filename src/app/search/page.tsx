import { ListCard } from "@/components/lists/list-card";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { SearchForm } from "@/components/search/search-form";
import type { List } from "@/types/list";
import type { SortOrder } from 'mongoose';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: 'newest' | 'most-viewed';
  }> | {
    q?: string;
    category?: string;
    sort?: 'newest' | 'most-viewed';
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  let lists: List[] = [];
  
  try {
    await dbConnect();
    
    const filter: any = { privacy: "public" };
    
    // Search in both title and item titles/comments
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

    const sortOptions: Record<string, Record<string, SortOrder>> = {
      'most-viewed': { viewCount: -1, createdAt: -1 },
      'newest': { createdAt: -1 }
    };

    const sort = sortOptions[resolvedParams.sort || 'newest'];

    const results = await ListModel
      .find(filter)
      .sort(sort)
      .limit(20)
      .lean();

    lists = results.map(list => ({
      id: list._id.toString(),
      ownerId: list.ownerId,
      ownerName: list.ownerName,
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
    console.error('Search error:', error);
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Search Lists</h1>
      
      <div className="mb-8">
        <SearchForm 
          defaultValues={{
            q: resolvedParams.q,
            category: resolvedParams.category,
            sort: resolvedParams.sort,
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
          No lists found. Try adjusting your search.
        </p>
      )}
    </div>
  );
} 