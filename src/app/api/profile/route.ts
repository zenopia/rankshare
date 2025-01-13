import { auth } from "@clerk/nextjs/server";
import { UserModel } from "@/lib/db/models/user";
import dbConnect from "@/lib/db/mongodb";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations/api";
import { handleApiError, apiResponse, validateRequest } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await rateLimit('get-profile', { limit: 30, window: 60 });

    const { userId } = auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await dbConnect();
    const user = await UserModel.findOne({ clerkId: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await rateLimit('update-profile', { limit: 10, window: 60 });

    const { userId } = auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Validate request data
    const data = await validateRequest<ProfileUpdateInput>(request, profileUpdateSchema);
    await dbConnect();

    let user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      throw new Error('User not found');
    }

    user = await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { ...data },
      { new: true, runValidators: true }
    );

    const isComplete = Boolean(
      user.location &&
      user.dateOfBirth &&
      user.gender &&
      user.livingStatus
    );

    if (user.isProfileComplete !== isComplete) {
      user = await UserModel.findOneAndUpdate(
        { clerkId: userId },
        { isProfileComplete: isComplete },
        { new: true }
      );
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
} 