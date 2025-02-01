import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getUserModel } from "@/lib/db/models-v2/user";

export async function POST(
  request: Request,
  { params }: { params: { listId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { pinned } = await request.json();
    
    await connectToMongoDB();
    const ListModel = await getListModel();
    const PinModel = await getPinModel();
    const UserModel = await getUserModel();

    // Find the list
    const list = await ListModel.findById(params.listId).lean();
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Get the owner's username
    const owner = await UserModel.findOne({ clerkId: list.owner.clerkId }).lean();
    if (!owner) {
      return new NextResponse("List owner not found", { status: 404 });
    }

    // Check if the list is public or if the user has access
    const hasAccess =
      list.privacy === "public" ||
      list.owner.clerkId === user.id ||
      list.collaborators?.some(
        (c) => c.clerkId === user.id && c.status === "accepted"
      );

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the pin already exists
    const existingPin = await PinModel.findOne({
      listId: list._id,
      clerkId: user.id
    });

    if (pinned && !existingPin) {
      // Create new pin
      await PinModel.create({
        listId: list._id,
        clerkId: user.id,
        listInfo: {
          title: list.title,
          category: list.category,
          ownerUsername: owner.username
        },
        lastViewedAt: new Date()
      });

      return NextResponse.json({ pinned: true });
    } else if (!pinned && existingPin) {
      // Remove pin
      await PinModel.deleteOne({ listId: list._id, clerkId: user.id });
      return NextResponse.json({ pinned: false });
    } else {
      // No change needed
      return NextResponse.json({ pinned: !!existingPin });
    }
  } catch (error) {
    console.error("Error toggling pin:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { listId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectToMongoDB();
    const PinModel = await getPinModel();

    const pin = await PinModel.findOne({
      listId: params.listId,
      clerkId: user.id
    });

    return NextResponse.json({ pinned: !!pin });
  } catch (error) {
    console.error("Error checking pin status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 