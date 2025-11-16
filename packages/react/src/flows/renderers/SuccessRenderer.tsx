/**
 * Success screen renderer
 */

import React from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { User, Session } from '@authsome/ui-core';

export interface SuccessRendererProps {
  user: User;
  session: Session;
  uiComponents: UIComponents;
  onLogout?: () => void;
}

export function SuccessRenderer({
  user,
  session,
  uiComponents,
  onLogout,
}: SuccessRendererProps) {
  const { signOut } = useAuth();
  const { Button, Alert, icons } = uiComponents;
  const SuccessIcon = icons?.success;

  const handleLogout = async () => {
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
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back!</h2>
        <p className="text-gray-600 mt-2">
          {user.email && `You're signed in as ${user.email}`}
        </p>
      </div>

      {Alert && (
        <Alert variant="success">
          Authentication successful. Your session is now active.
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
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          Sign Out
        </Button>
      )}
    </div>
  );
}

