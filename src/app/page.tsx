import { MainLayout } from "@/components/layout/main-layout";
import { ListGrid } from "@/components/lists/list-grid";
import { ListTabs } from "@/components/lists/list-tabs";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";
import { MongoListDocument } from "@/types/mongo";
import { serializeLists } from "@/lib/utils";
import { CreateListFAB } from "@/components/lists/create-list-fab";

interface SearchParams {
  q?: string;
  category?: string;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function HomePage({ searchParams }: PageProps) {
  await connectToMongoDB();
  const ListModel = await getListModel();

  // Build base query
  const baseQuery = {
    privacy: 'public'
  };

  // Add search filter if query exists
  const searchFilter = searchParams.q ? {
    $or: [
      { title: { $regex: searchParams.q, $options: 'i' } },
      { description: { $regex: searchParams.q, $options: 'i' } }
    ]
  } : {};

  // Add category filter if specified
  const categoryFilter = searchParams.category ? {
    category: searchParams.category
  } : {};

  // Combine all filters
  const filter = {
    ...baseQuery,
    ...searchFilter,
    ...categoryFilter
  };

  // Get lists
  const lists = await ListModel.find(filter).lean() as unknown as MongoListDocument[];

  // Serialize lists
  const serializedLists = serializeLists(lists);

  // Sort lists
  const sortedLists = [...serializedLists].sort((a, b) => {
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
