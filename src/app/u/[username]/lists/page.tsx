import { clerkClient } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { UserLists } from "@/components/lists/user-lists";
import { getPublicLists } from "@/lib/actions/lists";

interface ListsPageProps {
  params: {
    username: string;
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ListsPage({ params }: ListsPageProps) {
  try {
    // Remove @ if present and decode the username
    const cleanUsername = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from Clerk
    const users = await clerkClient.users.getUserList({
      username: [cleanUsername]
    });
    const user = users[0];

    if (!user || !user.username) {
      notFound();
    }

    // Get public lists for this user
    const lists = await getPublicLists(user.id);

    return (
      <MainLayout>
        <UserLists 
          userId={user.id}
          username={user.username}
          displayName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
          lists={lists}
        />
      </MainLayout>
    );
  } catch (error) {
    console.error('Error loading user lists:', error);
    notFound();
  }
} 