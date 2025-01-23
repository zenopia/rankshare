import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListViewModel } from "@/lib/db/models-v2/list-view";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { listIds } = await request.json();
    if (!Array.isArray(listIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const ListViewModel = await getListViewModel();

    // Get all list views for the user
    const listViews = await ListViewModel.find({
      clerkId: userId,
      listId: { $in: listIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();

    // Create a map of listId to lastViewedAt
    const lastViewedMap = listViews.reduce((acc, view) => {
      acc[view.listId.toString()] = view.lastViewedAt;
      return acc;
    }, {} as Record<string, Date>);

    return NextResponse.json(lastViewedMap);
  } catch (error) {
    console.error("Failed to fetch list view data:", error);
    return NextResponse.json(
      { error: "Failed to fetch list view data" },
      { status: 500 }
    );
  }
} 