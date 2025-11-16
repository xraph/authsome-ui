/**
 * Auth client configuration
 * 
 * Adapters are now in separate packages for better modularity
 */

import { AuthClient } from '@authsome/ui-core';
import { AuthSomeAdapter } from '@authsome/adapter-authsome';
import { SupabaseAdapter } from '@authsome/adapter-supabase';
import { GenericAdapter } from '@authsome/adapter-generic';

export type ProviderType = 'authsome' | 'supabase' | 'generic';

// Singleton auth client
let authClient: AuthClient | null = null;
let initPromise: Promise<AuthClient> | null = null;

export async function createAuthClient(provider: ProviderType = 'authsome'): Promise<AuthClient> {
  if (authClient) {
    return authClient;
  }

  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    let adapter;

    switch (provider) {
      case 'authsome':
        adapter = new AuthSomeAdapter();
        await adapter.initialize({
          apiUrl: process.env.NEXT_PUBLIC_AUTHSOME_API_URL || 'http://localhost:8080/api/auth',
        });
        break;

      case 'supabase':
        adapter = new SupabaseAdapter({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        });
        await adapter.initialize();
        break;

      case 'generic':
        adapter = new GenericAdapter({
          baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
          endpoints: {
            signIn: '/auth/login',
            signUp: '/auth/register',
            signOut: '/auth/logout',
            getCurrentUser: '/auth/me',
            getCurrentSession: '/auth/session',
          },
        });
        await adapter.initialize();
        break;

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    authClient = new AuthClient({
      provider: adapter,
      autoRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    });

    return authClient;
  })();

  return initPromise;
}

export function getAuthClient(): AuthClient {
  if (!authClient) {
    return createAuthClient();
  }
  return authClient;
}

