"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { SignedIn } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SignedIn>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetHeader className="px-4 py-2">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigate through your lists and discover new ones
                  </SheetDescription>
                </SheetHeader>
                <Sidebar onNavigate={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          </SignedIn>
          <Link href="/" className="text-xl font-bold">
            RankShare
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link 
              href="/search" 
              className="text-sm hover:text-primary hidden md:block"
            >
              Search
            </Link>
            <Link 
              href="/lists/create" 
              className="text-sm hover:text-primary hidden md:block"
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