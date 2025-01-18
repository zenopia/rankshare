import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md p-6 space-y-4 text-center">
        <div className="flex justify-center">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Private List</h1>
        <p className="text-muted-foreground">
          This list is private. You need to be the owner or a collaborator to view it.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/my-lists">
              View My Lists
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
} 