import { Home, Search, Plus, Bell } from "lucide-react";
import Link from "next/link";

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg">
      <div className="container flex items-center justify-around py-2">
        <Link href="/" className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <Home className="h-6 w-6" />
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <Search className="h-6 w-6" />
        </Link>
        <Link href="/lists/new" className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <Plus className="h-6 w-6" />
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <Bell className="h-6 w-6" />
        </Link>
      </div>
    </nav>
  );
} 
