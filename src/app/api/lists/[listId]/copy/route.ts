import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { ListModel } from "@/lib/db/models/list";
import type { ListItem } from "@/types/list";

export async function POST(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    await dbConnect();

    const originalList = await ListModel.findById(params.listId);
    
    if (!originalList) {
      return new NextResponse(
        JSON.stringify({ error: "List not found" }), 
        { status: 404 }
      );
    }

    const newList = await ListModel.create({
      ownerId: userId,
      ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
      title: `Copy of ${originalList.title}`,
      category: originalList.category,
      description: originalList.description,
      items: originalList.items.map((item: ListItem, index: number) => ({
        title: item.title,
        rank: index + 1,
        comment: item.comment,
      })),
      privacy: 'private',
      viewCount: 0,
    });

    return new NextResponse(
      JSON.stringify(newList), 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error copying list:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to copy list'
      }), 
      { status: 500 }
    );
  }
} 