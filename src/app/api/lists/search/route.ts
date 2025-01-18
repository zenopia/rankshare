import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { FilterQuery } from "mongoose";
import { MongoListDocument } from "@/types/mongo";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    const searchParams = req.nextUrl.searchParams;
    
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const owner = searchParams.get('owner');
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Build match conditions for the aggregation pipeline
    const matchConditions: FilterQuery<MongoListDocument>[] = [];

    // Add search conditions
    if (q) {
      matchConditions.push({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { 'items.title': { $regex: q, $options: 'i' } },
          { 'items.properties.value': { $regex: q, $options: 'i' } },
          { 'ownerDetails.username': { $regex: q, $options: 'i' } },
          { 'ownerDetails.displayName': { $regex: q, $options: 'i' } }
        ]
      });
    }

    // Add category filter
    if (category) {
      matchConditions.push({ category });
    }

    // Add visibility filter
    if (userId) {
      matchConditions.push({
        $or: [
          { privacy: 'public' },
          { privacy: 'private', 'owner.clerkId': userId },
          { privacy: 'private', 'collaborators': { $elemMatch: { clerkId: userId, status: 'accepted' } } }
        ]
      });
    } else {
      matchConditions.push({ privacy: 'public' });
    }

    // Add owner filter
    if (owner === 'owned' && userId) {
      matchConditions.push({ 'owner.clerkId': userId });
    } else if (owner === 'collaborated' && userId) {
      matchConditions.push({
        'collaborators.clerkId': userId,
        'collaborators.status': 'accepted'
      });
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

    // Build aggregation pipeline
    const pipeline = [
      // Join with users collection to get owner details
      {
        $lookup: {
          from: 'users',
          let: { ownerClerkId: '$owner.clerkId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$clerkId', '$$ownerClerkId'] }
              }
            },
            {
              $project: {
                username: 1,
                displayName: 1
              }
            }
          ],
          as: 'ownerDetails'
        }
      },
      {
        $unwind: '$ownerDetails'
      },
      // Match conditions
      {
        $match: matchConditions.length > 0 ? { $and: matchConditions } : {}
      },
      // Sort
      { $sort: sortOptions },
      // Pagination
      { $skip: skip },
      { $limit: limit }
    ];

    const countPipeline = [
      // Join with users collection
      {
        $lookup: {
          from: 'users',
          let: { ownerClerkId: '$owner.clerkId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$clerkId', '$$ownerClerkId'] }
              }
            },
            {
              $project: {
                username: 1,
                displayName: 1
              }
            }
          ],
          as: 'ownerDetails'
        }
      },
      {
        $unwind: '$ownerDetails'
      },
      // Match conditions
      {
        $match: matchConditions.length > 0 ? { $and: matchConditions } : {}
      },
      // Count
      { $count: 'total' }
    ];

    const [lists, [countResult]] = await Promise.all([
      ListModel.aggregate(pipeline),
      ListModel.aggregate(countPipeline)
    ]);

    const total = countResult?.total || 0;

    // Convert MongoDB documents to List type
    const serializedLists = lists.map((list: MongoListDocument & { ownerDetails: { username: string; displayName: string } }) => ({
      id: list._id.toString(),
      title: list.title,
      description: list.description,
      category: list.category,
      privacy: list.privacy,
      owner: {
        ...list.owner,
        username: list.ownerDetails.username,
        displayName: list.ownerDetails.displayName
      },
      items: list.items,
      stats: list.stats,
      collaborators: list.collaborators,
      lastEditedAt: list.lastEditedAt,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      editedAt: list.editedAt
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