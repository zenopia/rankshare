import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { accept } = await req.json();

    await connectToMongoDB();
    const ListModel = await getListModel();

    const result = await ListModel.findOneAndUpdate(
      {
        _id: params.listId,
        'collaborators': {
          $elemMatch: {
            clerkId: userId,
            status: 'pending'
          }
        }
      },
      {
        $set: {
          'collaborators.$.status': accept ? 'accepted' : 'rejected',
          'collaborators.$.acceptedAt': accept ? new Date() : undefined
        }
      },
      { new: true }
    ).lean();

    if (!result) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[RESPOND_TO_COLLABORATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 