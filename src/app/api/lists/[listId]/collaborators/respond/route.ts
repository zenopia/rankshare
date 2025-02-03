import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { withAuth, getUserId } from "@/lib/auth/api-utils";

export const dynamic = 'force-dynamic';

interface RouteParams {
  listId: string;
}

export const POST = withAuth<RouteParams>(async (
  req: NextRequest,
  { params }: { params: RouteParams }
) => {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const { action } = body;

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const ListModel = await getListModel();

    const list = await ListModel.findById(params.listId);
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Find the collaboration invitation
    const collaborator = list.collaborators?.find(
      (c) => c.clerkId === userId && c.status === "pending"
    );

    if (!collaborator) {
      return NextResponse.json(
        { error: "No pending invitation found" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Accept the invitation
      await ListModel.findOneAndUpdate(
        {
          _id: params.listId,
          "collaborators.clerkId": userId,
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
            collaborators: { clerkId: userId },
          },
        }
      );

      return NextResponse.json({ status: "declined" });
    }
  } catch (error) {
    console.error("Error responding to collaboration:", error);
    return NextResponse.json(
      { error: "Failed to respond to collaboration" },
      { status: 500 }
    );
  }
}, { requireAuth: true }); 