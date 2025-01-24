import { SubLayout } from "@/components/layout/sub-layout";
import { UserProfile } from "@/components/users/user-profile";
import { ListGrid } from "@/components/lists/list-grid";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { connectToMongoDB } from "@/lib/db/client";
import { serializeUser } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { MongoUserDocument } from "@/types/mongo";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { getEnhancedLists } from "@/lib/actions/lists";
import type { ListCategory } from "@/types/list";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    q?: string;
    category?: ListCategory;
    sort?: string;
  };
}

export default async function UserPage({ params, searchParams }: PageProps) {
  try {
    const { userId } = await auth();

    // Remove @ if present and decode the username
    const username = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from Clerk first
    let profileUser;
    try {
      const users = await clerkClient.users.getUserList({
        username: [username]
      });
      profileUser = users[0];
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      notFound();
    }
    
    if (!profileUser) {
      console.error(`User not found in Clerk: ${username}`);
      notFound();
    }

    // Connect to MongoDB
    await connectToMongoDB();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();
    const FollowModel = await getFollowModel();

    // Get user data from MongoDB
    const mongoUser = (await UserModel.findOne({ 
      $or: [
        { clerkId: profileUser.id },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    }).lean()) as unknown as MongoUserDocument;

    // Get user profile data
    const userProfile = await UserProfileModel.findOne({ userId: mongoUser._id }).lean();

    // Build filter for lists
    const filter = { 
      $or: [
        { 'owner.clerkId': profileUser.id },
        { 'owner.userId': mongoUser._id }
      ],
      privacy: 'public',
      ...(searchParams.category ? { category: searchParams.category } : {})
    };

    // Get enhanced lists with owner data and last viewed timestamps
    const { lists, lastViewedMap } = await getEnhancedLists(filter);

    // Get follow counts
    const [followerCount, followingCount] = await Promise.all([
      FollowModel.countDocuments({ followingId: profileUser.id, status: 'accepted' }),
      FollowModel.countDocuments({ followerId: profileUser.id, status: 'accepted' })
    ]);

    // Get follow status if logged in
    const followStatus = userId ? await FollowModel.findOne({
      followerId: userId,
      followingId: profileUser.id
    }).lean() : null;

    // Serialize user data
    const baseUser = serializeUser(mongoUser);
    const serializedUser = {
      ...baseUser,
      bio: userProfile?.bio,
      location: userProfile?.location,
      dateOfBirth: userProfile?.dateOfBirth,
      gender: userProfile?.gender,
      livingStatus: userProfile?.livingStatus,
      privacySettings: userProfile?.privacySettings || {
        showBio: true,
        showLocation: true,
        showDateOfBirth: false,
        showGender: true,
        showLivingStatus: true
      }
    };

    return (
      <SubLayout title={username}>
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <UserProfile 
              username={profileUser.username || ""}
              fullName={`${profileUser.firstName || ""} ${profileUser.lastName || ""}`.trim()}
              bio={serializedUser?.bio || null}
              imageUrl={profileUser.imageUrl}
              stats={{
                followers: followerCount,
                following: followingCount,
                lists: lists.length,
              }}
              isFollowing={!!followStatus}
              hideFollow={userId === profileUser.id}
              userData={serializedUser}
            />
            
            <div className="space-y-4">
              <ListGrid 
                lists={lists}
                searchParams={searchParams}
                showPrivacyBadge
                lastViewedMap={lastViewedMap}
              />
            </div>
          </div>
        </div>
      </SubLayout>
    );
  } catch (error) {
    console.error("Error in UserPage:", error);
    notFound();
  }
}