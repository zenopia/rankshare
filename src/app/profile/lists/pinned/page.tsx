import { redirect } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { getPinnedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";
import { ListCategory } from "@/types/list";

interface PageProps {
  searchParams: {
    q?: string;
    category?: ListCategory;
    sort?: string;
  };
}

export default async function PinnedListsPage({ searchParams }: PageProps) {
  try {
    // Get user details
    const user = await AuthService.getCurrentUser();
    if (!user) {
      // Store the current URL for return after sign in
      const returnUrl = encodeURIComponent(`/profile/lists/pinned${
        searchParams.q || searchParams.category || searchParams.sort 
          ? `?${new URLSearchParams(searchParams as Record<string, string>).toString()}`
          : ''
      }`);
      redirect(`/sign-in?returnUrl=${returnUrl}`);
    }

    // Get lists
    const listsData = await getPinnedLists(user.id);
    const { lists: unsortedLists } = listsData;
    
    // Apply sorting
    const sortedLists = [...unsortedLists].sort((a, b) => {
      switch (searchParams.sort) {
        case 'views':
          return (b.stats.viewCount || 0) - (a.stats.viewCount || 0);
        case 'pins':
          return (b.stats.pinCount || 0) - (a.stats.pinCount || 0);
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return (
      <MyListsLayout 
        lists={sortedLists}
        initialUser={{
          id: user.id,
          username: user.username || null,
          fullName: user.fullName || null,
          imageUrl: user.imageUrl || "",
        }}
      />
    );
  } catch (error) {
    console.error('Error loading pinned lists page:', error);
    // Store the current URL for return after sign in
    const returnUrl = encodeURIComponent(`/profile/lists/pinned${
      searchParams.q || searchParams.category || searchParams.sort 
        ? `?${new URLSearchParams(searchParams as Record<string, string>).toString()}`
        : ''
    }`);
    redirect(`/sign-in?returnUrl=${returnUrl}`);
  }
} 