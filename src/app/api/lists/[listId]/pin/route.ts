import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { ListModel } from "@/lib/db/models/list";
import { PinnedListModel } from "@/lib/db/models/pinned-list";

export async function POST(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = params;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return new NextResponse("Invalid list ID", { status: 400 });
    }

    await connectToDatabase();

    // Check if list exists and is public or user has access
    const list = await ListModel.findOne({
      _id: listId,
      $or: [
        { privacy: "public" },
        { "owner.clerkId": userId },
        {
          collaborators: {
            $elemMatch: {
              clerkId: userId,
              status: "accepted",
            },
          },
        },
      ],
    }).lean();

    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Create pinned list
    await PinnedListModel.create({
      userId,
      listId: new mongoose.Types.ObjectId(listId),
    });

    // Increment pin count
    await ListModel.updateOne(
      { _id: listId },
      { $inc: { "stats.pinCount": 1 } }
    );

    return new NextResponse("OK");
  } catch (error: any) {
    if (error.code === 11000) {
      return new NextResponse("Already pinned", { status: 400 });
    }

    console.error("[LIST_PIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = params;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return new NextResponse("Invalid list ID", { status: 400 });
    }

    await connectToDatabase();

    // Delete pinned list
    const result = await PinnedListModel.deleteOne({
      userId,
      listId: new mongoose.Types.ObjectId(listId),
    });

    if (result.deletedCount === 0) {
      return new NextResponse("Not pinned", { status: 404 });
    }

    // Decrement pin count
    await ListModel.updateOne(
      { _id: listId },
      { $inc: { "stats.pinCount": -1 } }
    );

    return new NextResponse("OK");
  } catch (error) {
    console.error("[LIST_UNPIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 