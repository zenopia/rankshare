import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ListModel } from "@/lib/db/models/list";
import { PinnedListModel } from "@/lib/db/models/pinned-list";
import { serializeLists } from "@/lib/utils";
import type { MongoListDocument } from "@/types/mongo";

export async function GET(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const q = searchParams.get("q");
    const limit = 6;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    // Get pinned list IDs for the user with sorting
    let sortQuery: any = {};
    switch (sort) {
      case "oldest":
        sortQuery = { pinnedAt: 1 };
        break;
      case "updated":
        sortQuery = { updatedAt: -1 };
        break;
      case "popular":
        sortQuery = { "stats.viewCount": -1 };
        break;
      default:
        sortQuery = { pinnedAt: -1 };
    }

    const pinnedLists = await PinnedListModel.find({ userId })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get the actual lists
    const listIds = pinnedLists.map((pin) => pin.listId);

    // Build query for lists
    const query: any = {
      _id: { $in: listIds },
    };

    if (category && category !== "all") {
      query.category = category;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const lists = await ListModel.find(query).lean<MongoListDocument[]>();

    // Sort lists in the same order as pinned lists
    const sortedLists = listIds
      .map((id) => lists.find((list) => list._id.equals(id)))
      .filter((list): list is MongoListDocument => !!list);

    return NextResponse.json(serializeLists(sortedLists));
  } catch (error) {
    console.error("[LISTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 