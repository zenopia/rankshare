import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { ApiError } from "@/lib/errors";

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse;
    }

    await dbConnect();

    // Find the list and verify ownership
    const list = await ListModel.findById(params.listId);
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 }) as NextResponse;
    }

    if (list.ownerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse;
    }

    // Delete the list
    await ListModel.findByIdAndDelete(params.listId);

    return NextResponse.json(null, { status: 204 }) as NextResponse;
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }) as NextResponse;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse;
    }

    await dbConnect();
    const data = await request.json();
    
    const list = await ListModel.findById(params.listId);
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 }) as NextResponse;
    }

    if (list.ownerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse;
    }

    const updatedList = await ListModel.findByIdAndUpdate(
      params.listId,
      { $set: { ...data, lastEditedAt: new Date() } },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedList) as NextResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      ) as NextResponse;
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    ) as NextResponse;
  }
} 