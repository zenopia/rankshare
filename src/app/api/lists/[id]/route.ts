import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";

interface ApiError {
  message: string;
  status: number;
}

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
    const data = await request.json();
    
    const now = new Date();

    const updatedList = await ListModel.findByIdAndUpdate(
      params.id,
      { 
        $set: {
          ...data,
          lastEditedAt: now
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedList);
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Failed to update list',
      status: 500
    };
    return NextResponse.json(apiError, { status: apiError.status });
  }
} 