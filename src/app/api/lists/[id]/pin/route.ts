import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";

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
    
    // Check if pin already exists
    const existingPin = await PinModel.findOne({
      userId,
      listId: params.id
    });

    if (existingPin) {
      return new NextResponse("List already pinned", { status: 400 });
    }

    // Create new pin
    const pin = await PinModel.create({
      userId,
      listId: params.id,
      lastViewedAt: new Date()
    });

    // Increment pin count on list
    await ListModel.findByIdAndUpdate(
      params.id,
      { $inc: { totalPins: 1 } },
      { timestamps: false }
    );

    return NextResponse.json(pin);
  } catch (error) {
    console.error('Error pinning list:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
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
    
    // Delete pin
    const result = await PinModel.findOneAndDelete({
      userId,
      listId: params.id
    });

    if (!result) {
      return new NextResponse("Pin not found", { status: 404 });
    }

    // Decrement pin count on list
    await ListModel.findByIdAndUpdate(
      params.id,
      { $inc: { totalPins: -1 } },
      { timestamps: false }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error unpinning list:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 