import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getEnhancedLists } from "@/lib/actions/lists";

export async function GET(request: Request) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
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
            clerkId: user.id,
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
          clerkId: user.id,
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
} 