import { Navbar } from "@/components/layout/nav/navbar";
import { Sidebar } from "@/components/layout/nav/sidebar";
import { ConditionalBottomNav } from "@/components/layout/nav/conditional-bottom-nav";

export interface MainLayoutProps {
  children?: React.ReactNode;
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