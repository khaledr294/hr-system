// Global polyfill for browser APIs in server environment
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  (global as any).self = (global as any).self || global;
  (global as any).window = (global as any).window || {};
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  (global as any).window = {};
}

if (typeof self === 'undefined' && typeof global !== 'undefined') {
  (global as any).self = global;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export {};