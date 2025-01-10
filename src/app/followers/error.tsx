'use client';
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
export default function FollowersError({ error }: { error: Error }) {
  return (
    <ErrorBoundaryWrapper>
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-4">Something went wrong.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-500 mb-4">{error.message}</p>
        )}
      </div>
    </ErrorBoundaryWrapper>
  );
} 