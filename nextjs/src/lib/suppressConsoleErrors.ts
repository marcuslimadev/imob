/**
 * Suppress specific console errors from being displayed in the browser console
 * This is useful for development to hide known errors that don't affect functionality
 */

if (typeof window !== 'undefined') {
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    // Suppress "Error fetching site data" errors (403 Forbidden from Directus)
    if (args[0]?.includes?.('Error fetching site data')) {
      return;
    }
    
    // Suppress "Failed to load resource: 401" errors
    const argsStr = JSON.stringify(args);
    if (argsStr.includes('401') || argsStr.includes('Unauthorized')) {
      return;
    }
    
    // Call original console.error for other errors
    originalError.apply(console, args);
  };
}

export {};
