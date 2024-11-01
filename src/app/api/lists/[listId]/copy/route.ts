import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { ListModel } from "@/lib/db/models/list";

export async function POST(
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

    await dbConnect();

    // Get the original list
    const originalList = await ListModel.findById(resolvedParams.listId).lean();
    if (!originalList) {
      return new NextResponse(
        JSON.stringify({ error: "List not found" }), 
        { status: 404 }
      );
    }

    // Create a new list with copied content
    const newList = await ListModel.create({
      ownerId: userId,
      ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
      title: `Copy of ${originalList.title}`,
      category: originalList.category,
      description: originalList.description,
      items: originalList.items.map((item: any, index: number) => ({
        title: item.title,
        rank: index + 1,
        comment: item.comment,
      })),
      privacy: 'private', // Default to private for copied lists
      viewCount: 0,
    });

    return new NextResponse(
      JSON.stringify(newList), 
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("[LIST_COPY]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to copy list"
      }), 
      { status: 500 }
    );
  }
} 