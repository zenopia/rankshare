import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { logDatabaseAccess } from "@/lib/db/migration-utils";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, category, privacy = 'private' } = data;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    logDatabaseAccess('List Creation', true);
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    // Get user info for owner details
    const user = await UserModel.findOne({ clerkId: userId })
      .select('username displayName')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create new list with owner info
    const list = await ListModel.create({
      title,
      description,
      category,
      privacy,
      owner: {
        userId: user._id,
        clerkId: userId,
        username: user.username,
        joinedAt: new Date()
      },
      collaborators: [],
      items: [],
      stats: {
        viewCount: 0,
        pinCount: 0,
        copyCount: 0
      }
    });

    // Increment user's list count
    await UserModel.updateOne(
      { clerkId: userId },
      { $inc: { listCount: 1 } }
    );

    return NextResponse.json(list, { status: 201 });
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

    logDatabaseAccess('List Fetch', true);
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