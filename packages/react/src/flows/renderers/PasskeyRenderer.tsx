/**
 * Passkey/WebAuthn authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { FlowState } from '@authsome/ui-core';

export interface PasskeyRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
}

export function PasskeyRenderer({
  state: _state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
}: PasskeyRendererProps) {
  const { authenticateWithPasskey } = useAuth();
  const { Button, Alert, icons } = uiComponents;
  const KeyIcon = icons?.key;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await authenticateWithPasskey({});
      await onNext({
        user: result.user,
        session: result.session,
      });
    } catch (err: any) {
      setError(err.message || 'Passkey authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {KeyIcon && <KeyIcon className="mx-auto h-16 w-16 text-blue-600" />}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Use Your Passkey</h2>
        <p className="text-sm text-gray-600 mt-1">
          Authenticate using your device&apos;s biometric sensors or security key
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <div className="space-y-4">
        <Button
          onClick={handleAuthenticate}
          loading={loading || isLoading}
          className="w-full"
        >
          Authenticate with Passkey
        </Button>

        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            disabled={loading || isLoading}
            className="w-full"
          >
            Use Different Method
          </Button>
        )}
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>Your device will prompt you to:</p>
        <ul className="mt-2 space-y-1">
          <li>• Use Touch ID or Face ID</li>
          <li>• Insert your security key</li>
          <li>• Use Windows Hello</li>
        </ul>
      </div>
    </div>
  );
}

