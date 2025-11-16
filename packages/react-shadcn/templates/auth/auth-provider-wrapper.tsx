'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthClient } from '@authsome/ui-core';
import { AuthProvider } from '@authsome/ui-react';
import { Loader2 } from 'lucide-react';

interface AuthProviderWrapperProps {
  authClient: AuthClient | (() => Promise<AuthClient>);
  children: ReactNode;
  loadingComponent?: ReactNode;
}

export function AuthProviderWrapper({
  authClient: authClientOrFactory,
  children,
  loadingComponent,
}: AuthProviderWrapperProps) {
  const [client, setClient] = useState<AuthClient | null>(
    typeof authClientOrFactory === 'function' ? null : authClientOrFactory
  );

  useEffect(() => {
    if (typeof authClientOrFactory === 'function') {
      authClientOrFactory().then(setClient);
    }
  }, [authClientOrFactory]);

  if (!client) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      )
    );
  }

  return <AuthProvider client={client}>{children}</AuthProvider>;
}

