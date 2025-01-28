import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import type { UserDocument } from "@/lib/db/models-v2/user";

const TEST_USER_ID = process.env.TEST_USER_ID;
const TEST_TOKEN = process.env.TEST_TOKEN;

interface ListProperty {
  type?: string;
  label: string;
  value: string;
}

interface ListItem {
  title: string;
  comment?: string;
  properties?: ListProperty[];
}

export async function POST(request: Request) {
  try {
    // Check for test token in development
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (process.env.NODE_ENV === 'development' && 
        authHeader === `Bearer ${TEST_TOKEN}` && 
        TEST_USER_ID) {
      userId = TEST_USER_ID;
    } else {
      // Regular Clerk authentication
      const authResult = auth();
      userId = authResult.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, category, privacy = 'private', items = [] } = data;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    // Process items to ensure they have valid structure
    const processedItems = items.map((item: ListItem, index: number) => ({
      title: item.title,
      rank: index + 1,
      comment: item.comment,
      properties: (item.properties || []).map((prop: ListProperty) => ({
        type: prop.type || 'text',
        label: prop.label || '',
        value: prop.value || ''
      }))
    }));

    // Combine operations: find/update user and create list
    const [user, list] = await Promise.all([
      // Find or update user in one operation
      UserModel.findOneAndUpdate(
        { clerkId: userId },
        { $inc: { listCount: 1 } },
        { 
          new: true,  // Return updated document
          select: '_id username displayName'
        }
      ) as Promise<UserDocument | null>,
      // Create list (will be executed in parallel)
      ListModel.create({
        title,
        description,
        category,
        privacy,
        owner: {
          userId: new mongoose.Types.ObjectId(), // Initialize with temporary ObjectId
          clerkId: userId,
          username: '', // Will update this after user operation
          joinedAt: new Date()
        },
        collaborators: [],
        items: processedItems,
        stats: {
          viewCount: 0,
          pinCount: 0,
          copyCount: 0
        }
      })
    ]);

    if (!user || !user._id) {
      // Rollback list creation if user not found
      await ListModel.findByIdAndDelete(list._id);
      return NextResponse.json(
        { error: "User not found or invalid user ID" },
        { status: 404 }
      );
    }

    // Update the list with the user's details and get the updated list
    const updatedList = await ListModel.findByIdAndUpdate(
      list._id,
      {
        'owner.userId': user._id,
        'owner.username': user.username
      },
      { new: true }
    ).lean();

    if (!updatedList) {
      throw new Error('Failed to update list with user details');
    }

    // Convert _id to string for the response
    const responseList = {
      ...updatedList,
      id: updatedList._id.toString(),
      username: user.username,
      _id: undefined
    };

    return NextResponse.json(responseList, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const ListModel = await getListModel();

    // Build query based on authentication
    const query = userId
      ? {
          $or: [
            { 'owner.clerkId': userId },
            { privacy: 'public' },
            { privacy: 'unlisted' },
            {
              'collaborators': {
                $elemMatch: {
                  clerkId: userId,
                  status: 'accepted'
                }
              }
            }
          ]
        }
      : { privacy: 'public' };

    // Get lists with pagination
    const [lists, total] = await Promise.all([
      ListModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ListModel.countDocuments(query)
    ]);

    return NextResponse.json({
      results: lists,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
} 