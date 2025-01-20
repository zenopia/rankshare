import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/lists/list-tabs";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { connectToMongoDB } from "@/lib/db/client";
import { MongoListDocument } from "@/types/mongo";
import { CreateListFAB } from "@/components/lists/create-list-fab";
import { serializeList } from "@/lib/utils";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function PinnedPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) return null;

  await connectToMongoDB();
  const ListModel = await getListModel();
  const PinModel = await getPinModel();

  // Get all pins for the user
  const pins = await PinModel.find({ clerkId: userId }).lean();
  const listIds = pins.map(pin => pin.listId);

  // Get all pinned lists
  const lists = await ListModel.find({
    _id: { $in: listIds }
  }).lean() as unknown as MongoListDocument[];

  // Serialize lists
  const serializedLists = lists.map(serializeList);

  // Filter by search query
  const filteredLists = serializedLists.filter(list => {
    if (!searchParams.q) return true;
    return list.title.toLowerCase().includes(searchParams.q.toLowerCase());
  });

  // Filter by category
  const categoryFilteredLists = filteredLists.filter(list => {
    if (!searchParams.category) return true;
    return list.category === searchParams.category;
  });

  // Sort lists
  const sortedLists = [...categoryFilteredLists].sort((a, b) => {
    switch (searchParams.sort) {
      case 'views':
        return (b.stats.viewCount || 0) - (a.stats.viewCount || 0);
      case 'pins':
        return (b.stats.pinCount || 0) - (a.stats.pinCount || 0);
      case 'copies':
        return (b.stats.copyCount || 0) - (a.stats.copyCount || 0);
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <MainLayout>
      <div className="relative">
        <ListTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <ListGrid 
              lists={sortedLists}
              searchParams={searchParams}
            />
          </div>
        </div>
        <CreateListFAB />
      </div>
    </MainLayout>
  );
} 