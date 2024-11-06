import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  public: boolean;
  icon?: LucideIcon;
  description?: string;
} 