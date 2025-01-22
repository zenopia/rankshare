'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if we've already redirected in this session
    const hasRedirected = sessionStorage.getItem('hasRedirectedToAbout');
    
    if (!hasRedirected) {
      // Set the flag and redirect
      sessionStorage.setItem('hasRedirectedToAbout', 'true');
      router.push('/about');
    }
  }, [router]);

  return null;
} 