import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { withAuth, getUserId } from "@/lib/auth/api-utils";

export const dynamic = 'force-dynamic';

type RouteParams = Record<string, never>;

export const GET = withAuth<RouteParams>(async (req: NextRequest) => {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const listIds = searchParams.get("listIds")?.split(",") || [];

    if (listIds.length === 0) {
      return NextResponse.json({ pins: {} });
    }

    await connectToMongoDB();
    const PinModel = await getPinModel();

    const pins = await PinModel.find({
      clerkId: userId,
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
    return NextResponse.json(
      { error: "Failed to fetch pins" },
      { status: 500 }
    );
  }
}, { requireAuth: true }); 