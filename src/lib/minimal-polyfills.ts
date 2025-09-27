// Minimal polyfills for server-side rendering
/* eslint-disable @typescript-eslint/no-explicit-any */

// Only add polyfills if we're on server and they don't exist
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Minimal window.location mock
  const mockLocation = {
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
  };

  // Only add what's absolutely necessary
  if (!global.window) {
    (global as any).window = {
      location: mockLocation,
    };
  }
  
  if (!global.location) {
    (global as any).location = mockLocation;
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export {};