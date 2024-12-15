import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find the list and verify ownership
    const list = await ListModel.findById(params.id);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    if (list.ownerId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the list
    await ListModel.findByIdAndDelete(params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting list:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 