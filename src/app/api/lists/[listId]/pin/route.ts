import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { PinModel } from "@/lib/db/models/pin";
import { ListModel } from "@/lib/db/models/list";

export async function POST(req: Request, { params }: { params: { listId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Create pin and increment totalPins atomically
    await Promise.all([
      PinModel.create({
        userId,
        listId: params.listId,
        lastViewedAt: new Date(),
      }),
      ListModel.findByIdAndUpdate(params.listId, { $inc: { totalPins: 1 } })
    ]);

    return NextResponse.json({ message: "List pinned" }, { status: 200 });
  } catch (error) {
    console.error("[PIN_POST]", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to pin list"
      }, 
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