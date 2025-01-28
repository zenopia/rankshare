import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { getList } from "@/lib/actions/lists";
import { ListDetail } from "@/components/lists/list-detail";

interface ListDetailPageProps {
  params: {
    username: string;
    listId: string;
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  try {
    // Remove @ if present and decode the username
    const cleanUsername = decodeURIComponent(params.username).replace(/^@/, '');

    // Get the profile user from Clerk
    const users = await clerkClient.users.getUserList({
      username: [cleanUsername]
    });
    const profileUser = users[0];

    if (!profileUser || !profileUser.username) {
      notFound();
    }

    // Get current user for auth check
    const { userId } = auth();

    // Get list details
    const list = await getList(params.listId);
    if (!list) {
      notFound();
    }

    // Check if list belongs to user
    if (list.owner.clerkId !== profileUser.id) {
      notFound();
    }

    return (
      <MainLayout>
        <ListDetail 
          list={list}
          profileUserId={profileUser.id}
          displayName={`${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || profileUser.username}
          username={profileUser.username}
          isOwnList={userId === profileUser.id}
        />
      </MainLayout>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    notFound();
  }
} 