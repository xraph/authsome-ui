/**
 * Success screen renderer
 */

import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { User, Session } from '@authsome/ui-core';
import { defaultLocale, interpolate } from '@authsome/ui-core';

export interface SuccessRendererProps {
  user: User;
  session: Session;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
  onLogout?: () => void;
}

export function SuccessRenderer({
  user,
  session,
  uiComponents,
  rendererConfig,
  onLogout,
}: SuccessRendererProps) {
  const { signOut } = useAuth();
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  const SuccessIcon = icons?.success;
  const locale = rendererConfig?.locale || defaultLocale;

  // Defensive check: if user or session is missing, log error and show minimal success message
  if (!user || !session) {
    console.error('[SuccessRenderer] Rendered without valid user or session data');
    return (
      <div className="space-y-6 text-center py-6">
        {SuccessIcon ? (
          <SuccessIcon className="mx-auto h-20 w-20 text-green-500" />
        ) : (
          <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {locale.success?.signedIn || 'Welcome Back!'}
          </h2>
          <p className="text-gray-600 mt-2">
            Authentication successful
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (!signOut) {
      console.error('Sign out is not available');
      return;
    }
    
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="space-y-6 text-center py-6">
      {SuccessIcon ? (
        <SuccessIcon className="mx-auto h-20 w-20 text-green-500" />
      ) : (
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {user.name ? interpolate(locale.success?.welcome || 'Welcome, {name}!', { name: user.name }) : locale.success?.signedIn || 'Welcome Back!'}
        </h2>
        <p className="text-gray-600 mt-2">
          {user.email && `You're signed in as ${user.email}`}
        </p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="success">
          <AlertDescription>
            {locale.success?.signedIn || 'Authentication successful. Your session is now active.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-gray-50 rounded-lg p-6 text-left">
        <h3 className="font-semibold mb-3">Account Details</h3>
        <dl className="space-y-2 text-sm">
          {user.email && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
          )}
          {user.name && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Name:</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-600">Email Verified:</dt>
            <dd className="font-medium">{user.emailVerified ? '✓ Yes' : '✗ No'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Session ID:</dt>
            <dd className="font-mono text-xs">{session.id?.slice(0, 16)}...</dd>
          </div>
        </dl>
      </div>

      {onLogout && (
        <Button
          type="button"
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          {locale.auth?.signOut || 'Sign Out'}
        </Button>
      )}
    </div>
  );
}

