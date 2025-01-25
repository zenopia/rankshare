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
    const { 
      title, 
      description, 
      category, 
      privacy = 'private', 
      listType = 'ordered',
      items = [] 
    } = data;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    // First get the user to ensure we have their details
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Process items to ensure they have valid structure
    const processedItems = items.map((item: ListItem) => ({
      title: item.title,
      comment: item.comment,
      completed: false,
      properties: (item.properties || []).map((prop: ListProperty) => ({
        type: prop.type || 'text',
        label: prop.label || '',
        value: prop.value || ''
      }))
    }));

    // Create list with user details
    const list = await ListModel.create({
      title,
      description,
      category,
      privacy,
      listType,
      owner: {
        userId: user._id,
        clerkId: userId,
        username: user.username,
        joinedAt: new Date()
      },
      collaborators: [],
      items: processedItems,
      stats: {
        viewCount: 0,
        pinCount: 0,
        copyCount: 0
      }
    });

    // Increment user's list count
    await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { listCount: 1 } }
    );

    // Convert _id to string for the response
    const responseList = {
      ...list.toObject(),
      id: (list._id as { toString(): string }).toString(),
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