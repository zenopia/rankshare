"use client";

import { ArrowLeft, MessageSquare } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ConditionalBottomNav } from "@/components/layout/conditional-bottom-nav";

function FeedbackButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  return (
    <Link href={`/feedback?from=${encodeURIComponent(currentUrl)}`} prefetch={false}>
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
}

export function SubLayout({ children, title = "Page" }: SubLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between h-14 px-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
        <div className="flex items-center gap-2">
          <FeedbackButton />
        </div>
      </div>
      <main className="flex-1 px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        {children}
      </main>
      <ConditionalBottomNav />
    </div>
  );
} 