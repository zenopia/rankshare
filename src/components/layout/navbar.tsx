import Link from "next/link";
import { UserNav } from "./user-nav";
import { SignedIn } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          RankShare
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link 
              href="/search" 
              className="text-sm hover:text-primary"
            >
              Search
            </Link>
            <Link 
              href="/lists/create" 
              className="text-sm hover:text-primary"
            >
              Create List
            </Link>
          </SignedIn>
          <UserNav />
        </div>
      </div>
    </nav>
  );
} 