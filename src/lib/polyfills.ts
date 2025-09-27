// Global polyfill for browser APIs in server environment
/* eslint-disable @typescript-eslint/no-explicit-any */

// Define a comprehensive location object with all properties
const createMockLocation = () => ({
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  href: 'http://localhost:3000/',
  origin: 'http://localhost:3000',
  assign: () => {},
  replace: () => {},
  reload: () => {},
  toString: () => 'http://localhost:3000/',
  ancestorOrigins: [] as any,
});

// Create polyfills only if we're on server side
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Prevent destructuring errors by creating a proper mock
  const mockLocation = createMockLocation();
  
  // Create comprehensive window mock
  const mockWindow = {
    location: mockLocation,
    document: {
      documentElement: {
        className: '',
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false,
          toggle: () => false,
        }
      },
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
      createElement: () => ({
        click: () => {},
        href: '',
        download: '',
      }),
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    navigator: {
      userAgent: 'Node.js',
    },
    URL: {
      createObjectURL: () => '',
      revokeObjectURL: () => {},
    },
    alert: () => {},
    confirm: () => true,
    console: console,
  };
  
  // Assign to global
  (global as any).window = mockWindow;
  (global as any).self = global;
  (global as any).document = mockWindow.document;
  (global as any).location = mockLocation;
  (global as any).localStorage = mockWindow.localStorage;
  (global as any).navigator = mockWindow.navigator;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export {};