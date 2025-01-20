import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
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

    await connectToDatabase();
    const ListModel = await getListModel();
    const PinModel = await getPinModel();
    const UserModel = await getUserModel();

    // Check if list exists
    const list = await ListModel.findById(params.listId);
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Check if already pinned
    const existingPin = await PinModel.findOne({
      clerkId: userId,
      listId: list._id
    });

    if (existingPin) {
      return NextResponse.json(
        { error: "List already pinned" },
        { status: 400 }
      );
    }

    // Get owner's username
    const owner = await UserModel.findOne({ clerkId: list.owner.clerkId });
    if (!owner) {
      return NextResponse.json(
        { error: "List owner not found" },
        { status: 404 }
      );
    }

    // Create pin
    await PinModel.create({
      clerkId: userId,
      listId: list._id,
      listInfo: {
        title: list.title,
        category: list.category,
        ownerUsername: owner.username
      }
    });

    // Increment pin count
    await ListModel.findByIdAndUpdate(params.listId, {
      $inc: { 'stats.pinCount': 1 }
    });

    return NextResponse.json({ message: "List pinned successfully" });
  } catch (error) {
    console.error("Failed to pin list:", error);
    return NextResponse.json(
      { error: "Failed to pin list" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await connectToDatabase();
    const ListModel = await getListModel();
    const PinModel = await getPinModel();

    // Check if list exists
    const list = await ListModel.findById(params.listId);
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Remove pin
    const result = await PinModel.deleteOne({
      clerkId: userId,
      listId: list._id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Pin not found" },
        { status: 404 }
      );
    }

    // Decrement pin count
    await ListModel.findByIdAndUpdate(params.listId, {
      $inc: { 'stats.pinCount': -1 }
    });

    return NextResponse.json({ message: "List unpinned successfully" });
  } catch (error) {
    console.error("Failed to unpin list:", error);
    return NextResponse.json(
      { error: "Failed to unpin list" },
      { status: 500 }
    );
  }
} 