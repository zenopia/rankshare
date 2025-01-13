import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import { listCreateSchema, type CreateListInput } from "@/lib/validations/api";
import { handleApiError, apiResponse, validateRequest } from "@/lib/api-utils";
import { rateLimit } from "@/lib/rate-limit";
import type { SortOrder } from "mongoose";

export async function POST(request: Request) {
  try {
    // Rate limit check
    await rateLimit('create-list', { limit: 5, window: 60 });

    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await dbConnect();

    // Validate request data
    const data = await validateRequest<CreateListInput>(request, listCreateSchema);
    
    // Ensure ownerId is set to the authenticated user's ID
    const list = await ListModel.create({
      ...data,
      ownerId: userId
    });

    return apiResponse(list);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    // Rate limit check
    await rateLimit('list-search', { limit: 20, window: 60 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sort = searchParams.get('sort') || 'newest';
    const category = searchParams.get('category');

    await dbConnect();

    // Build query
    const filter = { privacy: "public" };
    if (category) {
      Object.assign(filter, { category });
    }

    // Build sort
    const sortOptions: { [key: string]: SortOrder } = {};
    switch (sort) {
      case 'most-viewed':
        sortOptions.viewCount = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'newest':
      default:
        sortOptions.createdAt = -1;
    }

    const [lists, total] = await Promise.all([
      ListModel.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      ListModel.countDocuments(filter)
    ]);

    return apiResponse({
      results: lists,
      total,
      page,
      pageSize
    });
  } catch (error) {
    return handleApiError(error);
  }
} 