/**
 * Passkey/WebAuthn authentication renderer
 */

import { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { defaultLocale } from '@authsome/ui-core';

export interface PasskeyRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

export function PasskeyRenderer({
  state: _state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  rendererConfig,
}: PasskeyRendererProps) {
  const { authenticatePasskey } = useAuth();
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};
  
  const PasskeyIcon = icons?.passkey || icons?.key;
  const locale = rendererConfig?.locale || defaultLocale;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    if (!authenticatePasskey) {
      setError(locale.errors?.generic || 'Passkey authentication is not available');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authenticatePasskey({});
      // Auth state is updated internally, just move to next step
      await onNext();
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Passkey authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {PasskeyIcon ? (
          <PasskeyIcon className="mx-auto h-16 w-16 text-blue-600" />
        ) : (
          <span className="text-6xl">🔑</span>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{locale.passkey?.usePasskey || 'Use Your Passkey'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Authenticate using your device&apos;s biometric sensors or security key
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Button
          onClick={handleAuthenticate}
          loading={loading || isLoading}
          className="w-full"
        >
          {locale.passkey?.signInWith || 'Authenticate with Passkey'}
        </Button>

        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            disabled={loading || isLoading}
            className="w-full"
          >
            {locale.common?.back || 'Use Different Method'}
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

