import { auth } from "@clerk/nextjs/server";
import { UserModel } from "@/lib/db/models/user";
import dbConnect from "@/lib/db/mongodb";
import { searchParamsSchema } from "@/lib/validations/api";
import { handleApiError, apiResponse } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";
import type { BaseUser } from "@/types/user";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await rateLimit('user-search', { limit: 20, window: 60 });

    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    
    // Validate search params with defaults
    const validatedParams = searchParamsSchema.parse({
      q: searchParams.get('q'),
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20'
    });

    await dbConnect();

    // Build query
    const query = validatedParams.q
      ? {
          $or: [
            { username: { $regex: validatedParams.q, $options: 'i' } },
            { email: { $regex: validatedParams.q, $options: 'i' } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .skip((validatedParams.page - 1) * validatedParams.pageSize)
        .limit(validatedParams.pageSize)
        .lean<BaseUser[]>(),
      UserModel.countDocuments(query)
    ]);

    // If authenticated, get follow status for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        isFollowing: userId
          ? Boolean(await UserModel.exists({ 
              followerId: userId, 
              followingId: user.clerkId 
            }))
          : false
      }))
    );

    return apiResponse({
      results: enrichedUsers,
      total,
      page: validatedParams.page,
      pageSize: validatedParams.pageSize
    });
  } catch (error) {
    return handleApiError(error);
  }
} 