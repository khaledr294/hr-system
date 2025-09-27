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

// Create comprehensive document mock
const createMockDocument = () => ({
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
  createElement: (tag: string) => ({
    click: () => {},
    href: '',
    download: '',
    tagName: tag.toUpperCase(),
    setAttribute: () => {},
    getAttribute: () => null,
    style: {},
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  getElementsByTagName: () => [],
  getElementsByClassName: () => [],
});

// Create polyfills only if we're on server side
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Prevent destructuring errors by creating a proper mock
  const mockLocation = createMockLocation();
  const mockDocument = createMockDocument();
  
  // Create comprehensive window mock
  const mockWindow = {
    location: mockLocation,
    document: mockDocument,
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
      platform: 'node',
      language: 'en',
    },
    URL: {
      createObjectURL: () => '',
      revokeObjectURL: () => {},
    },
    alert: () => {},
    confirm: () => true,
    console: console,
  };
  
  // Safely assign to global - avoid overriding existing properties
  try {
    if (!('window' in global)) {
      (global as any).window = mockWindow;
    }
    if (!('self' in global)) {
      (global as any).self = global;
    }
    if (!('document' in global)) {
      (global as any).document = mockDocument;
    }
    if (!('location' in global)) {
      (global as any).location = mockLocation;
    }
    if (!('localStorage' in global)) {
      (global as any).localStorage = mockWindow.localStorage;
    }
    // Skip navigator as it might be readonly in some environments
  } catch (error) {
    // Silently ignore errors when setting readonly properties
    console.warn('Warning: Could not set all polyfill properties:', error);
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export {};