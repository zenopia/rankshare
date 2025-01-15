import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { connectToMongoDB } from "@/lib/db/client";
import type { MongoListDocument } from "@/types/mongodb";

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToMongoDB();
    
    // Get models
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    // Get the original list
    const originalList = await ListModel.findById(params.listId).lean() as unknown as MongoListDocument;
    if (!originalList) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Get user data
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Create new list with copied data
    const newList = await ListModel.create({
      title: originalList.title,
      description: originalList.description,
      category: originalList.category,
      privacy: originalList.privacy,
      items: originalList.items,
      owner: {
        userId: user._id,
        clerkId: userId,
        username: user.username,
        joinedAt: new Date()
      },
      stats: {
        viewCount: 0,
        pinCount: 0,
        copyCount: 0
      }
    });

    // Increment copy count on original list
    await ListModel.findByIdAndUpdate(
      params.listId,
      { $inc: { 'stats.copyCount': 1 } }
    );

    return NextResponse.json(newList);
  } catch (error) {
    console.error('Error copying list:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 