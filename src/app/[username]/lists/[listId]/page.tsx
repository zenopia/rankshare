import { auth, clerkClient } from "@clerk/nextjs/server";
import { getListModel, type ListDocument } from "@/lib/db/models-v2/list";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getPinModel } from "@/lib/db/models-v2/pin";
import { getListViewModel } from "@/lib/db/models-v2/list-view";
import { connectToMongoDB } from "@/lib/db/client";
import { notFound } from "next/navigation";
import type { EnhancedList, ListCategory } from "@/types/list";
import { ListPageContent } from "./list-page-content";
import { Metadata } from "next";

interface PageProps {
  params: {
    username: string;
    listId: string;
  };
  searchParams: {
    from?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
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
      return {};
    }

    if (!profileUser) {
      return {};
    }

    // Connect to MongoDB
    await connectToMongoDB();
    const ListModel = await getListModel();

    // Get list
    const list = await ListModel.findOne({ 
      _id: params.listId
    }).lean() as ListDocument & { _id: { toString(): string } };

    if (!list) {
      return {};
    }

    const displayName = `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username;
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const listUrl = `${siteUrl}/${username}/lists/${list._id.toString()}`;

    return {
      title: `${list.title} by ${displayName}`,
      description: list.description || `Check out ${displayName}'s list on Favely`,
      openGraph: {
        title: `${list.title} by ${displayName}`,
        description: list.description || `Check out ${displayName}'s list on Favely`,
        url: listUrl,
        siteName: 'Favely',
        type: 'article',
        authors: [displayName],
      },
      twitter: {
        card: 'summary',
        title: `${list.title} by ${displayName}`,
        description: list.description || `Check out ${displayName}'s list on Favely`,
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
}

export default async function ListPage({ params, searchParams }: PageProps) {
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
    const ListModel = await getListModel();
    const _UserModel = await getUserModel();
    const FollowModel = await getFollowModel();
    const PinModel = await getPinModel();
    const ListViewModel = await getListViewModel();

    // Get list
    const list = await ListModel.findOne({ 
      _id: params.listId
    }).lean() as ListDocument & { _id: { toString(): string } };

    if (!list) {
      notFound();
    }

    // Verify the list belongs to the requested user
    if (list.owner.clerkId !== profileUser.id) {
      notFound();
    }

    // Track list view if user is logged in and has access
    if (userId) {
      const isOwner = userId === list.owner.clerkId;
      const isCollaborator = list.collaborators?.some(c => c.clerkId === userId && c.status === 'accepted');
      const isPinned = await PinModel.exists({ listId: params.listId, clerkId: userId });

      if (isOwner || isCollaborator || isPinned) {
        const accessType = isOwner ? 'owner' : (isCollaborator ? 'collaborator' : 'pin');
        
        await ListViewModel.updateOne(
          { clerkId: userId, listId: list._id },
          { 
            $set: { 
              lastViewedAt: new Date(),
              accessType
            }
          },
          { upsert: true }
        );
      }
    }

    // Enhance list with owner data
    const enhancedList: EnhancedList = {
      id: list._id.toString(),
      title: list.title,
      description: list.description,
      category: list.category as ListCategory,
      privacy: list.privacy,
      items: list.items?.map(item => ({
        id: Math.random().toString(36).slice(2),
        title: item.title,
        comment: item.comment,
        rank: item.rank,
        properties: item.properties?.map(prop => ({
          id: Math.random().toString(36).slice(2),
          type: prop.type,
          label: prop.label,
          value: prop.value
        }))
      })) || [],
      stats: {
        viewCount: list.stats.viewCount,
        pinCount: list.stats.pinCount,
        copyCount: list.stats.copyCount
      },
      collaborators: list.collaborators?.map(c => ({
        id: Math.random().toString(36).slice(2),
        clerkId: c.clerkId || '',
        username: c.username || '',
        email: c.email,
        role: c.role,
        status: c.status,
        invitedAt: c.invitedAt.toISOString(),
        acceptedAt: c.acceptedAt?.toISOString()
      })),
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
      editedAt: list.editedAt?.toISOString(),
      owner: {
        id: profileUser.id,
        clerkId: list.owner.clerkId,
        username: profileUser.username || '',
        joinedAt: new Date(profileUser.createdAt).toISOString(),
        displayName: `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim(),
        imageUrl: profileUser.imageUrl || null
      }
    };

    // Get follow status if logged in
    const followStatus = userId ? await FollowModel.findOne({
      followerId: userId,
      followingId: profileUser.id
    }).lean() : null;

    // Check if user is a collaborator
    const isCollaborator = userId ? enhancedList.collaborators?.some(
      c => c.clerkId === userId && c.status === 'accepted'
    ) ?? false : false;

    // Check if list is pinned by current user
    const pinDoc = userId ? await PinModel.findOne({
      listId: params.listId,
      clerkId: userId
    }).lean() : null;

    // Get return path from query params or default to user's profile
    const returnPath = searchParams.from || `/${username}`;

    return (
      <ListPageContent
        list={enhancedList}
        isOwner={userId === profileUser.id}
        isPinned={!!pinDoc}
        isFollowing={!!followStatus}
        isCollaborator={isCollaborator}
        returnPath={returnPath}
      />
    );
  } catch (error) {
    console.error("Error in ListPage:", error);
    notFound();
  }
} 