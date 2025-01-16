import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({ 
        lists: [], 
        users: [],
        total: 0 
      });
    }

    const [ListModel, UserModel] = await Promise.all([
      getListModel(),
      getUserModel()
    ]);

    // Search for lists with access control
    const listsPromise = ListModel.find({
      $text: { $search: query },
      $or: [
        { privacy: 'public' },
        { 'owner.clerkId': userId },
        {
          privacy: 'private',
          collaborators: {
            $elemMatch: {
              clerkId: userId,
              status: 'accepted'
            }
          }
        }
      ]
    })
      .select({
        score: { $meta: 'textScore' },
        title: 1,
        description: 1,
        category: 1,
        privacy: 1,
        owner: 1,
        stats: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    // Search for users
    const usersPromise = UserModel.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .select({
        score: { $meta: 'textScore' },
        clerkId: 1,
        username: 1,
        displayName: 1,
        followersCount: 1,
        followingCount: 1,
        listCount: 1
      })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total counts for pagination
    const totalListsPromise = ListModel.countDocuments({
      $text: { $search: query },
      $or: [
        { privacy: 'public' },
        { 'owner.clerkId': userId },
        {
          privacy: 'private',
          collaborators: {
            $elemMatch: {
              clerkId: userId,
              status: 'accepted'
            }
          }
        }
      ]
    });

    const totalUsersPromise = UserModel.countDocuments({
      $text: { $search: query }
    });

    // Execute all queries in parallel
    const [lists, users, totalLists, totalUsers] = await Promise.all([
      listsPromise,
      usersPromise,
      totalListsPromise,
      totalUsersPromise
    ]);

    return NextResponse.json({
      lists,
      users,
      pagination: {
        total: totalLists + totalUsers,
        totalLists,
        totalUsers,
        page,
        pageSize: limit,
        hasMore: (skip + lists.length) < totalLists || (skip + users.length) < totalUsers
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
} 