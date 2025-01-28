import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ListModel } from "@/lib/db/models/list";
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

    // Build query
    const query: any = {
      "collaborators.clerkId": userId,
      "collaborators.status": "accepted",
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

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "updated":
        sortQuery = { updatedAt: -1 };
        break;
      case "popular":
        sortQuery = { "stats.viewCount": -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const lists = await ListModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean<MongoListDocument[]>();

    return NextResponse.json(serializeLists(lists));
  } catch (error) {
    console.error("[LISTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 