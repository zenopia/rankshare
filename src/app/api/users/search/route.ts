import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    console.log('Searching for users with query:', query);
    const users = await UserModel.find({
      searchIndex: { $regex: query, $options: 'i' }
    }).limit(20).lean();
    console.log('Found users:', users.length);

    // Get follow status for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (foundUser) => {
        const isFollowing = await FollowModel.exists({
          followerId: user.id,
          followingId: foundUser.clerkId,
          status: 'accepted'
        });

        return {
          _id: foundUser._id,
          clerkId: foundUser.clerkId,
          username: foundUser.username,
          displayName: foundUser.displayName,
          bio: foundUser.bio,
          imageUrl: foundUser.imageUrl,
          isFollowing: !!isFollowing
        };
      })
    );

    return NextResponse.json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 