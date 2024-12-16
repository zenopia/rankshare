import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ApiError } from "@/lib/errors";

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
      throw new ApiError("Unauthorized", 401);
    }

    await dbConnect();
    const data = await request.json();
    
    const list = await ListModel.findById(params.id);
    if (!list) {
      throw new ApiError("List not found", 404);
    }

    if (list.ownerId !== userId) {
      throw new ApiError("Unauthorized", 401);
    }

    const updatedList = await ListModel.findByIdAndUpdate(
      params.id,
      { $set: { ...data, lastEditedAt: new Date() } },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedList);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      const apiError = err as ApiError;
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.status }
      );
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 