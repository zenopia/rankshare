import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import type { ListDocument, ListCategory } from "@/types/list";
import type { MongoListFilter, MongoSortOptions } from "@/types/mongodb";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    
    await dbConnect();

    // Build query
    const filter: MongoListFilter = { privacy: "public" };
    
    if (searchParams.get("q")) {
      const searchQuery = searchParams.get("q") || '';
      
      // Add text search at the top level of the query
      filter.$text = { $search: searchQuery };
      
      // Add regex search for partial matches
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { ownerName: { $regex: searchQuery, $options: "i" } }
      ];
    }

    if (searchParams.get("category")) {
      filter.category = searchParams.get("category") as ListCategory;
    }

    // Build sort
    const sort: MongoSortOptions = {};
    
    if (searchParams.get("q")) {
      // If there's a search query, sort by text score first
      sort.score = { $meta: "textScore" };
    }
    
    // Then apply other sort criteria
    switch (searchParams.get("sort")) {
      case "most-viewed":
        sort.viewCount = -1;
        break;
      case "newest":
      default:
        sort.createdAt = -1;
    }

    const lists = await ListModel
      .find(filter)
      .sort(sort)
      .limit(20)
      .lean() as ListDocument[];

    // Transform and return results
    const transformedLists = lists.map(list => ({
      id: list._id.toString(),
      ownerId: list.ownerId,
      ownerName: list.ownerName,
      title: list.title,
      category: list.category,
      description: list.description,
      items: list.items || [],
      privacy: list.privacy,
      viewCount: list.viewCount,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      hasUpdate: userId ? false : undefined,
    }));

    return NextResponse.json({ lists: transformedLists });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search lists' },
      { status: 500 }
    );
  }
} 