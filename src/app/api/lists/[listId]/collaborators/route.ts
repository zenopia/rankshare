import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { MongoListDocument, MongoUserDocument } from "@/types/mongo";

export async function GET(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = (await ListModel.findById(params.listId).lean()) as unknown as MongoListDocument;
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user has access to the list
    if (list.privacy === "private" && !list.collaborators?.some((c: { clerkId: string }) => c.clerkId === userId) && list.owner.clerkId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all collaborators including the owner
    const collaborators = [
      { userId: list.owner.clerkId, role: "owner" as const },
      ...(list.collaborators?.map((c: { clerkId: string; role: string }) => ({
        userId: c.clerkId,
        role: c.role
      })) || [])
    ];

    // Get user details for all collaborators
    const users = (await UserModel.find({
      clerkId: { $in: collaborators.map(c => c.userId) }
    }).lean()) as unknown as MongoUserDocument[];

    // Combine user details with roles
    const collaboratorDetails = collaborators.map(collab => {
      const user = users.find((u: MongoUserDocument) => u.clerkId === collab.userId);
      return {
        userId: collab.userId,
        username: user?.username || "",
        role: collab.role
      };
    });

    return NextResponse.json(collaboratorDetails);
  } catch (error) {
    console.error("[LISTS_COLLABORATORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, userId: targetUserId, role } = await req.json();

    // Find user by email in Clerk if email is provided
    let clerkUserId = targetUserId;
    if (email && !targetUserId) {
      const [clerkUser] = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (!clerkUser) {
        return new NextResponse("User not found", { status: 404 });
      }
      clerkUserId = clerkUser.id;
    }

    await connectToMongoDB();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = (await ListModel.findById(params.listId).lean()) as unknown as MongoListDocument;
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Only owner can add collaborators
    if (list.owner.clerkId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find user in our database
    const collaborator = (await UserModel.findOne({ clerkId: clerkUserId }).lean()) as unknown as MongoUserDocument;
    if (!collaborator) {
      return new NextResponse("User not found in our database", { status: 404 });
    }

    // Check if user is already a collaborator
    if (list.collaborators?.some((c: { clerkId: string }) => c.clerkId === collaborator.clerkId)) {
      return new NextResponse("User is already a collaborator", { status: 400 });
    }

    // Add collaborator
    await ListModel.findByIdAndUpdate(params.listId, {
      $push: {
        collaborators: {
          clerkId: collaborator.clerkId,
          username: collaborator.username,
          role: role as "editor" | "viewer",
          status: "pending",
          invitedAt: new Date()
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LISTS_COLLABORATORS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 