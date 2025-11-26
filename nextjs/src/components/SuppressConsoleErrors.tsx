'use client';

import { useEffect } from 'react';

/**
 * Client component to suppress console errors and warnings
 * Must be used in a client component to access browser APIs
 */
export default function SuppressConsoleErrors() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console.error
    console.error = (...args: any[]) => {
      const message = String(args[0] || '');
      
      // Filter out known non-critical errors
      if (
        message.includes('401') ||
        message.includes('403') ||
        message.includes('Unauthorized') ||
        message.includes('Forbidden') ||
        message.includes('users/me') ||
        message.includes('Error fetching site data') ||
        message.includes('localhost:8055')
      ) {
        return; // Suppress
      }
      
      originalError.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      const message = String(args[0] || '');
      
      // Filter out React DevTools message
      if (message.includes('React DevTools')) {
        return; // Suppress
      }
      
      originalWarn.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null; // This component doesn't render anything
}
