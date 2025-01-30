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

    if (existingPin) {
      // If pin exists, remove it and decrement pin count
      await Promise.all([
        PinModel.findByIdAndDelete(existingPin._id),
        ListModel.findByIdAndUpdate(list._id, {
          $inc: { "stats.pinCount": -1 }
        })
      ]);

      return NextResponse.json({ pinned: false });
    } else {
      // If pin doesn't exist, create it and increment pin count
      await Promise.all([
        PinModel.create({
          listId: list._id,
          clerkId: user.id,
          listInfo: {
            title: list.title,
            category: list.category,
            ownerUsername: owner.username
          },
          lastViewedAt: new Date()
        }),
        ListModel.findByIdAndUpdate(list._id, {
          $inc: { "stats.pinCount": 1 }
        })
      ]);

      return NextResponse.json({ pinned: true });
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