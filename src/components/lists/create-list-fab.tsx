"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export function CreateListFAB() {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();

  const handleClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in?return_to=/lists/create');
      return;
    }

    router.push(`/${userId}/lists/create`);
  };

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-[60] sm:bottom-8 sm:right-8 h-14 px-6 shadow-lg flex items-center gap-2 fab-button"
    >
      <Plus className="h-5 w-5" />
      <span>Create list</span>
    </Button>
  );
} 