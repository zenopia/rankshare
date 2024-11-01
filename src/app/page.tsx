import { ListCard } from "@/components/lists/list-card";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import Link from "next/link";
import { List } from "@/types/list";
import { MongoDoc } from "@/types/mongodb";

export default async function HomePage() {
  let recentLists: List[] = [];
  
  try {
    await dbConnect();
    const lists = await ListModel
      .find({ privacy: "public" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Convert MongoDB documents to plain objects
    recentLists = lists.map((list: MongoDoc) => ({
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
    console.error('Failed to fetch lists:', error);
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Recent Lists</h1>
        <Link 
          href="/lists/create"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Create List
        </Link>
      </div>

      {recentLists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No lists found. Be the first to create one!
        </p>
      )}
    </div>
  );
}
