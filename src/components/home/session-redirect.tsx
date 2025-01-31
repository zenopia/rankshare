'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Try to get the flag from sessionStorage
      const hasRedirected = sessionStorage.getItem('hasRedirectedToAbout');
      
      if (!hasRedirected) {
        // Only set the flag if sessionStorage is available
        try {
          sessionStorage.setItem('hasRedirectedToAbout', 'true');
        } catch (e) {
          // Ignore errors if sessionStorage is not available
          console.warn('SessionStorage not available:', e);
        }

        // Only redirect on the home page, not on other pages
        if (window.location.pathname === '/') {
          router.push('/about');
        }
      }
    } catch (e) {
      // If sessionStorage is not available, just continue without redirecting
      console.warn('Error accessing sessionStorage:', e);
    }
  }, [router]);

  return null;
} 