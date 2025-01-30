import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";

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

    // Find the original list
    const originalList = await ListModel.findById(params.listId).lean();
    if (!originalList) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if the list is public or if the user has access
    const hasAccess =
      originalList.privacy === "public" ||
      originalList.owner.clerkId === user.id ||
      originalList.collaborators?.some(
        (c) => c.clerkId === user.id && c.status === "accepted"
      );

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a copy of the list
    const copiedList = await ListModel.create({
      ...originalList,
      _id: undefined,
      title: `Copy of ${originalList.title}`,
      owner: {
        clerkId: user.id,
        userId: user.id,
        username: user.username || "",
        joinedAt: new Date()
      },
      collaborators: [],
      stats: {
        viewCount: 0,
        pinCount: 0,
        copyCount: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      editedAt: new Date()
    });

    // Increment the copy count of the original list
    await ListModel.findByIdAndUpdate(params.listId, {
      $inc: { "stats.copyCount": 1 }
    });

    return NextResponse.json({ list: copiedList });
  } catch (error) {
    console.error("Error copying list:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 