"use client";

import { ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ConditionalBottomNav } from "@/components/layout/conditional-bottom-nav";
import { useUser } from "@clerk/clerk-react";

function FeedbackButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  return (
    <Link href={`/feedback?from=${encodeURIComponent(currentUrl)}`}>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </Link>
  );
}

interface SubLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtext?: string;
  hideBottomNav?: boolean;
}

export function SubLayout({ children, title = "Page", subtext, hideBottomNav }: SubLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const handleBack = () => {
    const from = searchParams.get('from');
    
    // If we're on a sign-in or sign-up page
    if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
      router.back();
      return;
    }

    // If we're on a following/followers page
    if (pathname.includes('/following') || pathname.includes('/followers')) {
      // Extract the username from the path
      const username = pathname.split('/')[1];
      // Go to the user's profile with the original from parameter preserved
      router.push(`/${username}${from ? `?from=${from}` : ''}`);
    } 
    // If we're on a profile page
    else if (pathname.split('/').length === 2) {
      if (from) {
        // If there's a from parameter, go there
        router.push(`/${from}`);
      } else {
        // If no from parameter, go to the signed-in user's following page
        router.push(`/${user?.username}/following`);
      }
    }
    // For any other page
    else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between h-14 px-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {title && (
            <div>
              <h1 className="text-lg font-semibold leading-tight">{title}</h1>
              {subtext && (
                <p className="text-sm text-muted-foreground leading-tight">
                  {subtext}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FeedbackButton />
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
      {!hideBottomNav && <ConditionalBottomNav />}
    </div>
  );
} 