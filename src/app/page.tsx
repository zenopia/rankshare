import { ListCard } from "@/components/lists/list-card";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { serializeLists } from '@/lib/utils';
import { CreateListFAB } from "@/components/lists/create-list-fab";
import { HomeTabs } from "@/components/home/home-tabs";
import type { ListDocument } from "@/types/list";

export default async function HomePage() {
  await dbConnect();

  // Fetch recent lists sorted by updatedAt
  const recentLists = await ListModel.find({ 
    privacy: 'public' 
  })
    .sort({ updatedAt: -1 }) // Sort by last edited date, newest first
    .limit(10)
    .lean()
    .exec() as unknown as ListDocument[];

  const serializedLists = serializeLists(recentLists);

  return (
    <div>
      <HomeTabs />
      
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="space-y-8">
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
    </div>
  );
}
