/**
 * Multi-Factor Authentication (MFA) renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { FlowState } from '@authsome/ui-core';
import { TwoFactorMethod } from '@authsome/ui-core';

export interface MFARendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
}

export function MFARequiredRenderer({
  onNext,
  uiComponents,
}: {
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  uiComponents: UIComponents;
}) {
  const { Button, Alert, icons } = uiComponents;
  const ShieldIcon = icons?.shield;

  return (
    <div className="space-y-6 text-center py-6">
      {ShieldIcon && <ShieldIcon className="mx-auto h-16 w-16 text-blue-600" />}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Two-Factor Authentication Required</h2>
        <p className="text-gray-600 mt-2">
          Your account is protected with 2FA. Please verify your identity to continue.
        </p>
      </div>

      {Alert && (
        <Alert variant="info">
          This extra step helps keep your account secure.
        </Alert>
      )}

      <Button onClick={() => onNext()} className="w-full">
        Continue to Verification
      </Button>
    </div>
  );
}

export function MFASelectMethodRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
}: MFARendererProps) {
  const { Button } = uiComponents;
  const methods = state.mfaMethods || ['totp', 'sms'];

  const methodConfig: Record<string, { name: string; description: string; icon: string }> = {
    totp: { name: 'Authenticator App', description: 'Use your authenticator app', icon: '🔐' },
    sms: { name: 'SMS Code', description: 'Receive a code via SMS', icon: '📱' },
    email: { name: 'Email Code', description: 'Receive a code via email', icon: '📧' },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Choose Verification Method</h2>
        <p className="text-sm text-gray-600 mt-1">
          Select how you'd like to verify your identity
        </p>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const config = methodConfig[method as string];
          return (
            <Button
              key={method}
              onClick={() => onNext({ metadata: { ...state.metadata, mfaMethod: method } })}
              variant="outline"
              disabled={isLoading}
              className="w-full justify-start"
            >
              <span className="mr-3 text-2xl">{config?.icon || '🔒'}</span>
              <div className="text-left">
                <div className="font-medium">{config?.name || method}</div>
                <div className="text-xs text-gray-500">{config?.description}</div>
              </div>
            </Button>
          );
        })}
      </div>

      {onBack && (
        <Button onClick={onBack} variant="ghost" disabled={isLoading} className="w-full">
          Back
        </Button>
      )}
    </div>
  );
}

export function MFAVerifyRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
}: MFARendererProps) {
  const { verifyTwoFactor } = useAuth();
  const { Input, Button, Alert } = uiComponents;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await verifyTwoFactor({
        code,
        token: state.mfaToken,
        method: (state.metadata?.mfaMethod as TwoFactorMethod) || 'totp',
      });
      
      await onNext({
        user: result.user,
        session: result.session,
      });
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Enter Verification Code</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Authentication Code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          required
          disabled={loading || isLoading}
          className="text-center text-2xl tracking-widest"
          autoFocus
        />

        <div className="flex gap-2">
          {onBack && (
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              disabled={loading || isLoading}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            loading={loading || isLoading}
            className="flex-1"
          >
            Verify
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-gray-600">
        Lost your device?{' '}
        <button className="text-blue-600 hover:underline">Use backup code</button>
      </p>
    </div>
  );
}

