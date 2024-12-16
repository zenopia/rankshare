import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { canEditList } from "@/lib/auth/list-auth";

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if user can edit this list
    const canEdit = await canEditList(params.id, userId);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Not authorized to edit this list' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Update the list
    const updatedList = await ListModel.findByIdAndUpdate(
      params.id,
      {
        ...data,
        lastEditedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
} 