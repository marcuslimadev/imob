/**
 * Suppress specific console errors from being displayed in the browser console
 * This is useful for development to hide known errors that don't affect functionality
 */

if (typeof window !== 'undefined') {
  // Suppress console.error messages
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  console.error = (...args: any[]) => {
    const argsStr = args.map((arg: any) => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }

      return String(arg || '');
    }).join(' ');

    // Suppress specific error messages
    if (
      argsStr.includes('Error fetching site data') ||
      argsStr.includes('401') ||
      argsStr.includes('403') ||
      argsStr.includes('Unauthorized') ||
      argsStr.includes('Forbidden') ||
      argsStr.includes('users/me') ||
      argsStr.includes('GET http://localhost:8055/users/me')
    ) {

      return;
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const argsStr = String(args[0] || '');

    // Suppress React DevTools download message
    if (argsStr.includes('React DevTools')) {

      return;
    }
    
    originalWarn.apply(console, args);
  };

  // Suppress console.log for specific messages
  console.log = (...args: any[]) => {
    const argsStr = String(args[0] || '');

    // Suppress specific log messages that look like errors
    if (
      argsStr.includes('GET http://localhost:8055/users/me') ||
      argsStr.includes('401 (Unauthorized)')
    ) {

      return;
    }
    
    originalLog.apply(console, args);
  };

  // Override window.addEventListener to suppress network error events
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    // Don't log network errors for failed resource loads
    if (type === 'error') {
        const wrappedListener = function(event: Event) {
          const target = event.target as HTMLElement;
          if (target?.tagName === 'IMG' || target?.tagName === 'SCRIPT' || target?.tagName === 'LINK') {
            const src = (target as any).src || (target as any).href;
            if (src?.includes('8055') || src?.includes('401') || src?.includes('403')) {
              event.preventDefault();
              event.stopPropagation();

              return;
            }
          }

          return listener(event);
        };

        return originalAddEventListener.call(this, type, wrappedListener, options);
      }

      return originalAddEventListener.call(this, type, listener, options);
    };
  }

export {};
