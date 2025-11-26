/**
 * Success screen renderer
 * 
 * This renderer is shown when the flow reaches the terminal SUCCESS step.
 * It handles auto-redirect based on the redirect configuration.
 * 
 * The redirect respects the flow system - it only triggers at SUCCESS,
 * allowing intermediate steps (like email verification) to be handled
 * by the flow engine.
 */

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks';
import { useFlow } from '../FlowContext';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { User, Session, FlowState } from '@authsome/ui-core';
import { defaultLocale, interpolate } from '@authsome/ui-core';

/**
 * Get callback URL from various sources
 * Priority: flowState.metadata.callbackUrl > URL params > defaultUrl
 */
function getRedirectUrl(flowState?: FlowState, defaultUrl: string = '/'): string {
  // Priority 1: callbackUrl from flow state metadata
  const metadataCallbackUrl = flowState?.metadata?.callbackUrl as string | undefined;
  if (metadataCallbackUrl) {
    return metadataCallbackUrl;
  }

  // Priority 2: callbackUrl from URL search params (client-side only)
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const urlCallbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirectTo');
    if (urlCallbackUrl) {
      return urlCallbackUrl;
    }
  }

  // Priority 3: default URL
  return defaultUrl;
}

export interface SuccessRendererProps {
  user: User;
  session: Session;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
  state?: FlowState;
  onLogout?: () => void;
}

export function SuccessRenderer({
  user,
  session,
  uiComponents,
  rendererConfig,
  state: propState,
  onLogout,
}: SuccessRendererProps) {
  const { signOut } = useAuth();
  
  // Try to get flow state from context, fall back to props
  let flowState: FlowState | undefined = propState;
  try {
    const flowContext = useFlow();
    flowState = flowContext?.state || propState;
  } catch {
    // useFlow throws if not in FlowProvider context, use propState
  }

  const { Button, Alert: AlertComponents, icons } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  const SuccessIcon = icons?.success;
  const locale = rendererConfig?.locale || defaultLocale;
  const redirectConfig = rendererConfig?.redirect;

  // Track if redirect has been initiated to prevent double redirects
  const redirectInitiated = useRef(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Handle auto-redirect when flow reaches SUCCESS
  useEffect(() => {
    // Only redirect if autoRedirect is enabled (default: true)
    if (redirectConfig?.autoRedirect === false) {
      return;
    }

    // Prevent double redirects
    if (redirectInitiated.current) {
      return;
    }

    // Need valid user and session to redirect
    if (!user || !session) {
      return;
    }

    redirectInitiated.current = true;
    setRedirecting(true);

    const defaultUrl = redirectConfig?.defaultUrl || '/';
    const targetUrl = getRedirectUrl(flowState, defaultUrl);
    setRedirectUrl(targetUrl);

    const delay = redirectConfig?.redirectDelay ?? 0;

    const performRedirect = () => {
      // Use custom redirect handler if provided
      if (redirectConfig?.onRedirect) {
        redirectConfig.onRedirect(targetUrl, user, session, flowState);
      } else {
        // Default: use window.location for full page navigation
        window.location.href = targetUrl;
      }
    };

    if (delay > 0) {
      const timer = setTimeout(performRedirect, delay);
      return () => clearTimeout(timer);
    } else {
      performRedirect();
      return; // No cleanup needed for immediate redirect
    }
  }, [user, session, flowState, redirectConfig]);

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

  // Show redirecting state if auto-redirect is happening
  if (redirecting && redirectConfig?.autoRedirect !== false) {
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
            Redirecting...
          </p>
          {redirectUrl && (
            <p className="text-gray-400 text-sm mt-1">
              → {redirectUrl}
            </p>
          )}
        </div>
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Show full success screen when autoRedirect is disabled
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

