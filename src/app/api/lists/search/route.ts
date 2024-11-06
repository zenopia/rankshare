import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import type { ListDocument, ListCategory } from "@/types/list";
import type { PinDocument } from "@/types/pin";
import type { MongoListFilter, MongoSortOptions } from "@/types/mongodb";
import type { SortOrder } from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    
    await dbConnect();

    // Build query
    const filter: MongoListFilter = { privacy: "public" };
    
    if (searchParams.get("q")) {
      filter.$or = [
        { title: { $regex: searchParams.get("q") || '', $options: "i" } },
        { description: { $regex: searchParams.get("q") || '', $options: "i" } },
      ];
    }

    if (searchParams.get("category")) {
      filter.category = searchParams.get("category") as ListCategory;
    }

    // Build sort
    const sort: MongoSortOptions = {};
    const sortOrder: SortOrder = -1;
    
    switch (searchParams.get("sort")) {
      case "most-viewed":
        sort.viewCount = sortOrder;
        break;
      case "newest":
      default:
        sort.createdAt = sortOrder;
    }

    const lists = await ListModel
      .find(filter)
      .sort(sort)
      .limit(20)
      .lean() as ListDocument[];

    // Get pins if user is logged in
    let pins: PinDocument[] = [];
    if (userId) {
      pins = await PinModel.find({ userId }).lean() as PinDocument[];
    }

    // Transform documents
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
      hasUpdate: userId ? pins.some((pin) => 
        pin.listId === list._id.toString() && 
        new Date(list.updatedAt) > new Date(pin.lastViewedAt)
      ) : false,
    }));

    return NextResponse.json(
      { lists: transformedLists },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search lists' }, 
      { status: 500 }
    );
  }
} 