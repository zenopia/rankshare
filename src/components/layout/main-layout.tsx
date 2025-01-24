import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { ConditionalBottomNav } from "./conditional-bottom-nav";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: {
    text: string;
    subtext?: string;
  };
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Navbar title={title} />
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