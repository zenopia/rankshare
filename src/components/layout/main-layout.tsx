import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { ConditionalBottomNav } from "./conditional-bottom-nav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 pb-[4.5rem] sm:pb-0">
          {children}
        </main>
      </div>
      <ConditionalBottomNav />
    </div>
  );
} 