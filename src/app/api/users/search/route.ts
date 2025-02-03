import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { AuthService } from "@/lib/services/auth.service";

export const dynamic = 'force-dynamic';

interface UserSearchResponse {
  users: Array<{
    id: string;
    username: string;
    displayName: string;
    imageUrl?: string;
  }>;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<UserSearchResponse | ErrorResponse>> {
  try {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchQuery = req.nextUrl.searchParams.get('q');
    if (!searchQuery) {
      return NextResponse.json<ErrorResponse>(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const UserModel = await getUserModel();

    // Search for users by username or displayName, excluding the current user
    const users = await UserModel.find({
      $and: [
        { clerkId: { $ne: user.id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { displayName: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    })
    .select('clerkId username displayName imageUrl')
    .limit(10)
    .lean();

    return NextResponse.json<UserSearchResponse>({
      users: users.map(user => ({
        id: user.clerkId,
        username: user.username,
        displayName: user.displayName || user.username,
        imageUrl: user.imageUrl
      }))
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 