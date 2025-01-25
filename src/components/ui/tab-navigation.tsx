import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  href: string;
  isProtected?: boolean;
  onProtectedClick?: (e: React.MouseEvent) => void;
  value?: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  useSearchParam?: string;
  className?: string;
}

export function TabNavigation({ tabs, useSearchParam, className }: TabNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isActiveTab = (tab: TabItem) => {
    if (useSearchParam) {
      const currentValue = searchParams?.get(useSearchParam) || tabs[0].value;
      return currentValue === tab.value;
    }
    if (tab.value) {
      return pathname === tab.value;
    }
    return pathname === tab.href.split('?')[0];
  };

  return (
    <div className={cn("border-b bg-background", className)}>
      <div className="px-4 md:px-6 lg:px-8">
        <nav 
          className="flex w-full -mb-px" 
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={tab.isProtected ? tab.onProtectedClick : undefined}
              className={cn(
                "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
                isActiveTab(tab)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 