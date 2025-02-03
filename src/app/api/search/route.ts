import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getListModel } from "@/lib/db/models-v2/list";
import type { UserDocument } from "@/lib/db/models-v2/user";
import type { ListDocument } from "@/lib/db/models-v2/list";
import { withAuth, getUserId } from "@/lib/auth/api-utils";

export const dynamic = 'force-dynamic';

// Search is public but can return more results when authenticated
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Get user ID if authenticated
    let userId: string | undefined;
    try {
      userId = getUserId(req);
    } catch {
      // User is not authenticated - this is fine for search
    }

    await connectToMongoDB();
    const UserModel = await getUserModel();
    const ListModel = await getListModel();

    let users: Partial<UserDocument>[] = [];
    let lists: Partial<ListDocument>[] = [];
    let total = 0;

    if (type === "users" || type === "all") {
      const userQuery = {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { displayName: { $regex: query, $options: "i" } }
        ]
      };

      [users, total] = await Promise.all([
        UserModel.find(userQuery)
          .select("username displayName bio imageUrl followersCount followingCount")
          .skip(skip)
          .limit(limit)
          .lean(),
        UserModel.countDocuments(userQuery)
      ]);
    }

    if (type === "lists" || type === "all") {
      const listQuery = {
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } }
            ]
          },
          {
            $or: [
              { privacy: "public" },
              ...(userId
                ? [
                    { "owner.clerkId": userId },
                    {
                      collaborators: {
                        $elemMatch: {
                          clerkId: userId,
                          status: "accepted"
                        }
                      }
                    }
                  ]
                : [])
            ]
          }
        ]
      };

      [lists, total] = await Promise.all([
        ListModel.find(listQuery)
          .select("title description category privacy owner stats")
          .skip(skip)
          .limit(limit)
          .lean(),
        ListModel.countDocuments(listQuery)
      ]);
    }

    return NextResponse.json({
      users: type === "lists" ? [] : users,
      lists: type === "users" ? [] : lists,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error("Error searching:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}, { requireAuth: false }); 