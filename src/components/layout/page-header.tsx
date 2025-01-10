"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  showBackButton = true,
  onBack,
  action 
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
      <div className="container max-w-3xl">
        <div className="flex h-14 items-center justify-between">
          <div className="flex-0">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="mr-2"
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
              </Button>
            ) : (
              <div className="w-8" />
            )}
          </div>

          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          <div className="flex-0 w-8">{action}</div>
        </div>
      </div>
    </div>
  );
} 