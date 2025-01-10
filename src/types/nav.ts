import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  description: string;
  public?: boolean;
  indent?: boolean;
  id?: string;
} 