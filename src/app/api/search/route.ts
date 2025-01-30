import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getListModel } from "@/lib/db/models-v2/list";
import type { UserDocument } from "@/lib/db/models-v2/user";
import type { ListDocument } from "@/lib/db/models-v2/list";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await AuthService.getCurrentUser();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

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
              ...(user
                ? [
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
} 