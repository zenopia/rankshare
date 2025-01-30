import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getEnhancedLists } from "@/lib/actions/lists";
import { FilterQuery } from "mongoose";
import { MongoListDocument } from "@/types/mongo";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await AuthService.getCurrentUser();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = {
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
          ]
        }
      ]
    };

    // Add category filter if specified
    if (category) {
      searchQuery.$and.push({ category });
    }

    // Add visibility conditions
    if (user) {
      searchQuery.$and.push({
        $or: [
          { privacy: "public" },
          { "owner.clerkId": user.id },
          {
            collaborators: {
              $elemMatch: {
                clerkId: user.id,
                status: "accepted"
              }
            }
          }
        ]
      });
    } else {
      searchQuery.$and.push({ privacy: "public" });
    }

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Get lists with pagination
    const [total, { lists }] = await Promise.all([
      ListModel.countDocuments(searchQuery),
      getEnhancedLists(searchQuery, { skip, limit, sort: { createdAt: -1 } })
    ]);

    return NextResponse.json({
      lists,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error("Error searching lists:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 