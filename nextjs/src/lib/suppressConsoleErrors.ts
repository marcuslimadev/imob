/**
 * Suppress specific console errors from being displayed in the browser console
 * This is useful for development to hide known errors that don't affect functionality
 */

if (typeof window !== 'undefined') {
  // Suppress console.error messages
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

  // Suppress network errors in browser DevTools
  // This prevents "Failed to load resource" messages from appearing
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Silently handle 401/403 from Directus without logging
      if ((response.status === 401 || response.status === 403) && 
          args[0]?.toString().includes('localhost:8055')) {
        // Return the response without logging the error
        return response;
      }
      
      return response;
    } catch (error) {
      // Suppress network errors from Directus
      const errorStr = error?.toString() || '';
      if (errorStr.includes('401') || errorStr.includes('403') || errorStr.includes('8055')) {
        // Create a mock failed response instead of throwing
        return new Response(null, { status: 401, statusText: 'Unauthorized' });
      }
      throw error;
    }
  };
}

export {};
