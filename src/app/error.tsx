"use client";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  username?: string;
}

export default function Error({
  error,
  reset,
  username,
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We&apos;re sorry, but there was an error processing your request
        </p>
        <div className="space-y-4">
          <Button onClick={reset}>
            Try again
          </Button>
          <div className="text-sm text-muted-foreground">
            <Button variant="link" onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 