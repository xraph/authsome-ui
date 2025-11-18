/**
 * Creates a Next.js-specific auth client from an adapter
 */

'use client';

import { AuthClient } from '@authsome/ui-core';
import type { AuthProvider } from '@authsome/ui-core';

export function createNextAuthClient(adapter: AuthProvider): AuthClient {
  // Create an AuthClient instance from the adapter
  // The AuthClient handles state management, subscriptions, and method proxying
  return new AuthClient({
    provider: adapter,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });
}

