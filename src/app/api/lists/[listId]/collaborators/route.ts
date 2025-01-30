import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { MongoListDocument, MongoUserDocument } from "@/types/mongo";
import { sendCollaborationInviteEmail } from "@/lib/email";
import { clerkClient } from "@clerk/clerk-sdk-node";

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
    const ListModel = await getListModel();

    const list = await ListModel.findById(params.listId).lean();
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user has access to view collaborators
    const hasAccess =
      list.owner.clerkId === user.id ||
      list.collaborators?.some(
        (c) => c.clerkId === user.id && c.status === "accepted"
      );

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({ collaborators: list.collaborators || [] });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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
    const { username, role = "editor" } = body;

    if (!username) {
      return new NextResponse("Username is required", { status: 400 });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();

    const list = await ListModel.findById(params.listId);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user is the owner
    if (list.owner.clerkId !== user.id) {
      return new NextResponse("Only the owner can add collaborators", {
        status: 401,
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = list.collaborators?.find(
      (c) => c.username === username
    );
    if (existingCollaborator) {
      return new NextResponse("User is already a collaborator", { status: 400 });
    }

    // Get the collaborator's user info
    const collaborator = await AuthService.getUserByUsername(username);
    if (!collaborator) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Add collaborator
    const updatedList = await ListModel.findByIdAndUpdate(
      params.listId,
      {
        $push: {
          collaborators: {
            clerkId: collaborator.id,
            username: collaborator.username,
            role,
            status: "pending",
            invitedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      collaborators: updatedList?.collaborators || [],
    });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 