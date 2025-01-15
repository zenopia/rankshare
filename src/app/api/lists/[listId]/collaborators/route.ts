import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { MongoListDocument } from "@/types/mongo";

export async function POST(
  req: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = await ListModel.findById(params.listId).lean() as unknown as MongoListDocument;
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    if (list.owner.clerkId !== userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const collaborators = list.collaborators || [];
    if (collaborators.some(c => c.email === email)) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email }).lean();
    const collaborator = {
      id: user?._id.toString() || crypto.randomUUID(),
      clerkId: user?.clerkId || '',
      username: user?.username || '',
      email,
      role: 'editor',
      status: 'pending',
      invitedAt: new Date()
    };

    await ListModel.findByIdAndUpdate(
      params.listId,
      { $push: { collaborators: collaborator } }
    );

    return NextResponse.json(collaborator);
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    return NextResponse.json(
      { error: "Failed to invite collaborator" },
      { status: 500 }
    );
  }
} 