import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { PinModel } from "@/lib/db/models/pin";

export async function POST(
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

    // Create pin
    await PinModel.create({
      userId,
      listId: resolvedParams.listId,
      lastViewedAt: new Date(),
    });

    return new NextResponse(
      JSON.stringify({ message: "List pinned successfully" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("[PIN_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to pin list"
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

    // Delete pin
    await PinModel.deleteOne({
      userId,
      listId: resolvedParams.listId,
    });

    return new NextResponse(
      JSON.stringify({ message: "List unpinned successfully" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("[PIN_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to unpin list"
      }), 
      { status: 500 }
    );
  }
} 