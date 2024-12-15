import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import type { MongoListDocument } from "@/types/mongodb";

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    
    // Get the original list
    const originalList = await ListModel.findById(params.id).lean() as MongoListDocument;
    if (!originalList) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Create new list with copied data
    const newList = await ListModel.create({
      ...originalList,
      _id: undefined,
      ownerId: userId,
      ownerName: originalList.ownerName,
      viewCount: 0,
      totalPins: 0,
      totalCopies: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Increment copy count on original list
    await ListModel.findByIdAndUpdate(params.id, {
      $inc: { totalCopies: 1 }
    });

    return NextResponse.json(newList);
  } catch (error) {
    console.error('Error copying list:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 