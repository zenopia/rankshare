'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';

const hideBottomNavPaths = ['/lists/'];

export function ConditionalBottomNav() {
  const pathname = usePathname();
  const shouldHideBottomNav = hideBottomNavPaths.some(path => pathname.startsWith(path));

  if (shouldHideBottomNav) {
    return null;
  }

  return <BottomNav />;
} 