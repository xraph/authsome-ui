'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthClient } from '@authsome/ui-core';
import { AuthProvider } from '@authsome/ui-react';
import { createAuthClient, ProviderType } from '@/lib/auth-client';
import { Shield } from 'lucide-react';

interface AuthProviderWrapperProps {
  provider?: ProviderType;
  children: ReactNode;
}

export function AuthProviderWrapper({ provider = 'authsome', children }: AuthProviderWrapperProps) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    createAuthClient(provider).then(setAuthClient);
  }, [provider]);

  if (!authClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthProvider client={authClient}>{children}</AuthProvider>;
}

