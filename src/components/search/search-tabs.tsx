"use client";

import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";
import { useSearchParams } from "next/navigation";

export function SearchTabs() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const tabs: TabItem[] = [
    {
      label: "Lists",
      href: `/search/lists${query ? `?q=${query}` : ''}`,
      value: "lists",
    },
    {
      label: "People",
      href: `/search/people${query ? `?q=${query}` : ''}`,
      value: "people",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 