import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";

export async function POST(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToMongoDB();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    // Get the original list
    const originalList = await ListModel.findById(params.listId).lean();
    if (!originalList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Get the user
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create a copy of the list
    const newList = await ListModel.create({
      title: `${originalList.title} (Copy)`,
      description: originalList.description,
      category: originalList.category,
      privacy: 'private', // Always start as private
      listType: originalList.listType || 'ordered', // Copy the list type or default to ordered
      owner: {
        userId: user._id,
        clerkId: userId,
        username: user.username,
        joinedAt: new Date()
      },
      items: originalList.items.map(item => ({
        title: item.title,
        comment: item.comment,
        completed: item.completed || false,
        properties: item.properties
      })),
      stats: {
        viewCount: 0,
        pinCount: 0,
        copyCount: 0
      }
    });

    // Increment the original list's copy count
    await ListModel.findByIdAndUpdate(params.listId, {
      $inc: { 'stats.copyCount': 1 }
    });

    // Increment user's list count
    await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { listCount: 1 } }
    );

    return NextResponse.json({
      id: newList._id,
      username: user.username,
      message: "List copied successfully"
    });
  } catch (error) {
    console.error("Failed to copy list:", error);
    return NextResponse.json(
      { error: "Failed to copy list" },
      { status: 500 }
    );
  }
} 