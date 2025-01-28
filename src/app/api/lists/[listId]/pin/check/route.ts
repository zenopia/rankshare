import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { PinnedListModel } from "@/lib/db/models/pinned-list";

export async function GET(
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

    const pinnedList = await PinnedListModel.findOne({
      userId,
      listId: new mongoose.Types.ObjectId(listId),
    }).lean();

    return NextResponse.json({
      isPinned: !!pinnedList,
    });
  } catch (error) {
    console.error("[LIST_PIN_CHECK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 