import { auth } from "@clerk/nextjs/server";
import { MainLayout } from "@/components/layout/main-layout";
import { ListSearchControls } from "@/components/lists/list-search-controls";
import { ListCard } from "@/components/lists/list-card";
import { ListTabs } from "@/components/lists/list-tabs";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";
import { serializeLists } from "@/lib/utils";
import type { ListCategory } from "@/types/list";
import type { MongoListDocument } from "@/types/mongo";
import { FilterQuery } from "mongoose";

interface PageProps {
  searchParams: {
    q?: string;
    category?: ListCategory;
    sort?: string;
  };
}

export default async function CollabPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  await connectToMongoDB();
  const ListModel = await getListModel();

  // Build filter
  const filter: FilterQuery<MongoListDocument> = {
    'collaborators.clerkId': userId,
    'collaborators.status': 'accepted'
  };

  if (searchParams.category) {
    filter.category = searchParams.category;
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {};
  switch (searchParams.sort) {
    case 'oldest':
      sort.createdAt = 1;
      break;
    case 'most-viewed':
      sort['stats.viewCount'] = -1;
      break;
    case 'newest':
    default:
      sort.createdAt = -1;
  }

  const lists = (await ListModel.find(filter)
    .sort(sort)
    .lean()) as unknown as MongoListDocument[];

  const serializedLists = serializeLists(lists);

  return (
    <MainLayout>
      <div className="relative">
        <ListTabs />
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSearchControls 
              defaultCategory={searchParams.category as ListCategory}
              defaultSort={searchParams.sort}
              
            />

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
        </div>
      </div>
    </MainLayout>
  );
} 