import { FilterQuery } from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { MongoListDocument } from "@/types/mongo";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    const searchParams = req.nextUrl.searchParams;
    
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const privacy = searchParams.get('privacy');
    const owner = searchParams.get('owner');
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Build base query
    const baseQuery: FilterQuery<MongoListDocument> = {};

    // Add search conditions
    if (q) {
      baseQuery.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'items.title': { $regex: q, $options: 'i' } },
        { 'items.properties.value': { $regex: q, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      baseQuery.category = category;
    }

    // Add privacy filter
    if (privacy === 'public') {
      baseQuery.privacy = 'public';
    } else if (privacy === 'private' && userId) {
      baseQuery.$or = [
        { 'owner.clerkId': userId },
        { 'collaborators.clerkId': userId, 'collaborators.status': 'accepted' }
      ];
    }

    // Add owner filter
    if (owner === 'owned' && userId) {
      baseQuery['owner.clerkId'] = userId;
    } else if (owner === 'collaborated' && userId) {
      baseQuery['collaborators.clerkId'] = userId;
      baseQuery['collaborators.status'] = 'accepted';
    }

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'views':
        sortOptions['stats.viewCount'] = -1;
        break;
      case 'pins':
        sortOptions['stats.pinCount'] = -1;
        break;
      case 'copies':
        sortOptions['stats.copyCount'] = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (page - 1) * limit;
    const lists = await ListModel.find(baseQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean() as unknown as MongoListDocument[];

    const total = await ListModel.countDocuments(baseQuery);

    // Convert MongoDB documents to List type
    const serializedLists = lists.map(list => ({
      id: list._id.toString(),
      title: list.title,
      description: list.description,
      category: list.category,
      privacy: list.privacy,
      owner: list.owner,
      items: list.items,
      stats: list.stats,
      collaborators: list.collaborators,
      lastEditedAt: list.lastEditedAt,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt
    }));

    return NextResponse.json({
      lists: serializedLists,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error searching lists:", error);
    return NextResponse.json(
      { error: "Failed to search lists" },
      { status: 500 }
    );
  }
} 