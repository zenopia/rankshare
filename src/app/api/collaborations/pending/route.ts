import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getEnhancedLists } from "@/lib/actions/lists";
import { withAuth, getUserId } from "@/lib/auth/api-utils";

export const dynamic = 'force-dynamic';

type RouteParams = Record<string, never>;

export const GET = withAuth<RouteParams>(async (req: NextRequest) => {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    await connectToMongoDB();
    const ListModel = await getListModel();

    // Get lists where the user has pending collaborations
    const { lists } = await getEnhancedLists(
      {
        "collaborators": {
          $elemMatch: {
            clerkId: userId,
            status: "pending"
          }
        }
      },
      { skip, limit, sort: { createdAt: -1 } }
    );

    // Get total count
    const total = await ListModel.countDocuments({
      "collaborators": {
        $elemMatch: {
          clerkId: userId,
          status: "pending"
        }
      }
    });

    return NextResponse.json({
      lists,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error("Error fetching pending collaborations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}); 