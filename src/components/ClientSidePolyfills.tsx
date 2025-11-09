'use client';

import { useEffect } from 'react';

export default function ClientSidePolyfills() {
  useEffect(() => {
    // This runs only on client side
    // No polyfills needed since window exists
  }, []);

  return null;
}
