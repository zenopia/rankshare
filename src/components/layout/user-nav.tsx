import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
 
export function UserNav() {
  return (
    <div className="flex items-center gap-4">
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Link 
          href="/sign-in"
          className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Sign In
        </Link>
      </SignedOut>
    </div>
  );
} 