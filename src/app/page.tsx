import { ListCard } from "@/components/lists/list-card";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { serializeLists } from '@/lib/utils';
import { CreateListFAB } from "@/components/lists/create-list-fab";
import type { ListDocument } from "@/types/list";

export default async function HomePage() {
  await dbConnect();

  // Fetch recent lists
  const recentLists = await ListModel.find({ 
    privacy: 'public' 
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .exec() as unknown as ListDocument[];

  // Use the same serialization function we use elsewhere
  const serializedLists = serializeLists(recentLists);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Recent Lists</h1>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {serializedLists.map((list) => (
            <ListCard 
              key={list.id} 
              list={list}
              showPrivacyBadge
            />
          ))}
        </div>
      </div>

      <CreateListFAB />
    </div>
  );
}
