'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function ErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', error);
      Sentry.captureException(error);
    };

    window.onunhandledrejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      Sentry.captureException(event.reason);
    };
  }, []);

  return <>{children}</>;
} 