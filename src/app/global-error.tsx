'use client';

import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  username?: string;
}

export default function GlobalError({
  error,
  reset,
  username,
}: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
          <h1 className="text-2xl font-bold">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We&apos;re sorry, but a critical error has occurred.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => reset()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10"
            >
              Return home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
} 