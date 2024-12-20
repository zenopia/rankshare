import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const updates = await req.json();

    const list = await ListModel.findOneAndUpdate(
      { 
        _id: params.id,
        ownerId: userId,
        "items.rank": parseInt(params.itemId)
      },
      { 
        $set: {
          "items.$.title": updates.title,
          "items.$.comment": updates.comment,
          "items.$.properties": updates.properties,
        }
      },
      { new: true }
    );

    if (!list) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating item:', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 