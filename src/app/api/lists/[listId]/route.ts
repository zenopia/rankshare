import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { ListModel } from "@/lib/db/models/list";

export async function GET(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    await dbConnect();
    const list = await ListModel.findById(params.listId);
    
    if (!list) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Add cache headers for public lists
    const headers: HeadersInit = {};
    if (list.privacy === "public") {
      headers['Cache-Control'] = 's-maxage=3600, stale-while-revalidate';
    } else {
      headers['Cache-Control'] = 'no-store';
    }

    // Increment view count
    if (list.privacy === "public") {
      list.viewCount += 1;
      await list.save();
    }

    return NextResponse.json(list, {
      headers,
      status: 200
    });
  } catch (error) {
    console.error("[LIST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = await auth();
    
    const list = await ListModel.findOne({ 
      _id: params.listId,
      ownerId: userId
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or unauthorized' },
        { status: 404 }
      );
    }

    const json = await request.json();
    
    await dbConnect();

    if (list.ownerId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // Add lastEditedAt when updating the list
    const updatedList = await ListModel.findByIdAndUpdate(
      params.listId,
      { 
        ...json,
        lastEditedAt: new Date(),
      },
      { new: true }
    );

    return new NextResponse(
      JSON.stringify(updatedList), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating list:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to update list"
      }), 
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
    
    const list = await ListModel.findOneAndDelete({ 
      _id: params.listId,
      ownerId: userId
    });

    if (!list) {
      return new NextResponse(
        JSON.stringify({ error: "List not found" }), 
        { status: 404 }
      );
    }

    if (list.ownerId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: "Not authorized to delete this list" }), 
        { status: 403 }
      );
    }

    await list.deleteOne();

    return new NextResponse(
      JSON.stringify({ message: "List deleted successfully" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("[LIST_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to delete list"
      }), 
      { status: 500 }
    );
  }
} 