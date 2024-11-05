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
      return new NextResponse("Not Found", { status: 404 });
    }

    // Add cache headers for public lists
    const headers = new Headers();
    if (list.privacy === "public") {
      headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    } else {
      headers.set('Cache-Control', 'no-store');
    }

    // Increment view count
    if (list.privacy === "public") {
      list.viewCount += 1;
      await list.save();
    }

    return new NextResponse(JSON.stringify(list), {
      headers,
      status: 200
    });
  } catch (error) {
    console.error("[LIST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const json = await req.json();
    
    await dbConnect();

    const list = await ListModel.findById(params.listId);
    if (!list) {
      return new NextResponse(
        JSON.stringify({ error: "List not found" }), 
        { status: 404 }
      );
    }

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
  req: Request,
  { params }: { params: Promise<{ listId: string }> | { listId: string } }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    await dbConnect();

    const list = await ListModel.findById(resolvedParams.listId);
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