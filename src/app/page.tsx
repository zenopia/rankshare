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
    <div className="px-4 md:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
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
