import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { listId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (!action || !["accept", "decline"].includes(action)) {
      return new NextResponse("Invalid action", { status: 400 });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();

    const list = await ListModel.findById(params.listId);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Find the collaboration invitation
    const collaborator = list.collaborators?.find(
      (c) => c.clerkId === user.id && c.status === "pending"
    );

    if (!collaborator) {
      return new NextResponse("No pending invitation found", { status: 404 });
    }

    if (action === "accept") {
      // Accept the invitation
      await ListModel.findOneAndUpdate(
        {
          _id: params.listId,
          "collaborators.clerkId": user.id,
        },
        {
          $set: {
            "collaborators.$.status": "accepted",
            "collaborators.$.acceptedAt": new Date(),
          },
        }
      );

      return NextResponse.json({ status: "accepted" });
    } else {
      // Decline the invitation
      await ListModel.findOneAndUpdate(
        { _id: params.listId },
        {
          $pull: {
            collaborators: { clerkId: user.id },
          },
        }
      );

      return NextResponse.json({ status: "declined" });
    }
  } catch (error) {
    console.error("Error responding to collaboration:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 