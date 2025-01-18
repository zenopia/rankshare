import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Find all lists where user is a pending collaborator
    const lists = await ListModel.aggregate([
      {
        $match: {
          'collaborators': {
            $elemMatch: {
              clerkId: userId,
              status: 'pending'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner.clerkId',
          foreignField: 'clerkId',
          as: 'ownerDetails'
        }
      },
      {
        $unwind: '$ownerDetails'
      }
    ]);

    // Transform the data to match the expected format
    const pendingCollaborations = lists.map(list => ({
      id: list._id.toString(),
      listId: list._id.toString(),
      listTitle: list.title,
      owner: {
        clerkId: list.owner.clerkId,
        username: list.ownerDetails.username
      },
      role: list.collaborators.find((c: { clerkId: string; role: string }) => c.clerkId === userId)?.role,
      status: list.collaborators.find((c: { clerkId: string; status: string }) => c.clerkId === userId)?.status
    }));

    return NextResponse.json(pendingCollaborations);
  } catch (error) {
    console.error("[GET_PENDING_COLLABORATIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 