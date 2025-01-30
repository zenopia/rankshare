import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getPinModel } from "@/lib/db/models-v2/pin";

export async function GET(request: Request) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const listIds = searchParams.get("listIds")?.split(",") || [];

    if (listIds.length === 0) {
      return NextResponse.json({ pins: {} });
    }

    await connectToMongoDB();
    const PinModel = await getPinModel();

    const pins = await PinModel.find({
      clerkId: user.id,
      listId: { $in: listIds }
    }).lean();

    // Convert to a map of listId -> pin
    const pinMap = pins.reduce((acc, pin) => {
      acc[pin.listId.toString()] = pin;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ pins: pinMap });
  } catch (error) {
    console.error("Error fetching pins:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 