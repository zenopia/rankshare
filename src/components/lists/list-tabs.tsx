"use client";

import { TabNavigation } from "@/components/ui/tab-navigation";

export function ListTabs() {
  const tabs = [
    {
      label: "Discovery",
      href: "/",
      value: "latest",
    },
    {
      label: "Pinned",
      href: "/pinned",
      value: "pinned",
    },
    {
      label: "My Lists",
      href: "/my-lists",
      value: "my-lists",
    },
    {
      label: "Collaborations",
      href: "/collab",
      value: "collab",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 