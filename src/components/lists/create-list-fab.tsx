"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export function CreateListFAB() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const handleClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in?return_to=/lists/create');
      return;
    }

    if (!user?.username) {
      toast.error("Could not load profile information");
      return;
    }

    router.push(`/${user.username}/lists/create`);
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