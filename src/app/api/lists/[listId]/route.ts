import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { ListModel } from "@/lib/db/models/list";
import { createListSchema } from "@/lib/validations/list";

interface ListItem {
  title: string;
  comment?: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ listId: string }> | { listId: string } }
) {
  try {
    const resolvedParams = await params;
    await dbConnect();

    const list = await ListModel.findById(resolvedParams.listId);
    if (!list) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Increment view count
    if (list.privacy === "public") {
      list.viewCount += 1;
      await list.save();
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("[LIST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listId: string }> | { listId: string } }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const json = await req.json();
    const validatedData = createListSchema.parse(json);

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
        JSON.stringify({ error: "Not authorized to edit this list" }), 
        { status: 403 }
      );
    }

    const updatedList = await ListModel.findByIdAndUpdate(
      resolvedParams.listId,
      {
        ...validatedData,
        ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
        items: json.items.map((item: ListItem, index: number) => ({
          title: item.title,
          rank: index + 1,
          comment: item.comment,
        })),
      },
      { new: true }
    ).lean();

    return new NextResponse(
      JSON.stringify(updatedList), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating list:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to update list'
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