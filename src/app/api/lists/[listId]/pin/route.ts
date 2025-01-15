import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { connectToMongoDB } from "@/lib/db/client";

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
    const ListModel = await getListModel();
    const PinModel = await getPinModel();

    // Get the list
    const list = await ListModel.findById(params.listId);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Create pin
    await PinModel.create({
      userId: list.owner.userId,
      listId: list._id,
      listInfo: {
        title: list.title,
        category: list.category,
        ownerUsername: list.owner.username
      }
    });

    // Increment pin count
    await ListModel.findByIdAndUpdate(
      params.listId,
      { $inc: { 'stats.pinCount': 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error pinning list:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();
    const PinModel = await getPinModel();

    // Delete pin
    const result = await PinModel.deleteOne({
      userId,
      listId: params.listId
    });

    if (result.deletedCount === 0) {
      return new NextResponse("Pin not found", { status: 404 });
    }

    // Decrement pin count
    await ListModel.findByIdAndUpdate(
      params.listId,
      { $inc: { 'stats.pinCount': -1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unpinning list:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 