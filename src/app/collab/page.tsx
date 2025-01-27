import { auth } from "@clerk/nextjs/server";
import { getEnhancedLists } from "@/lib/actions/lists";
import { CollabListsLayout } from "@/components/lists/collab-lists-layout";
import type { ListCategory } from "@/types/list";
import type { MongoListDocument } from "@/types/mongo";
import { FilterQuery } from "mongoose";

interface SearchParams {
  q?: string;
  category?: ListCategory;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

export default async function CollabListsPage({ searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) return null;

  // Build filter
  const filter: FilterQuery<MongoListDocument> = {
    collaborators: { $not: { $size: 0 } },
    $or: [
      { 'owner.clerkId': userId },
      {
        'collaborators.clerkId': userId,
        'collaborators.status': 'accepted'
      }
    ]
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
    case 'views':
      sort['stats.viewCount'] = -1;
      break;
    case 'pins':
      sort['stats.pinCount'] = -1;
      break;
    case 'newest':
      sort.createdAt = -1;
      break;
    default:
      sort.lastEditedAt = -1;
      sort.createdAt = -1; // fallback for items without lastEditedAt
  }

  // Get enhanced lists with owner data and last viewed timestamps
  const { lists, lastViewedMap } = await getEnhancedLists(filter, { sort });

  return (
    <CollabListsLayout lists={lists} searchParams={searchParams} lastViewedMap={lastViewedMap} />
  );
} 