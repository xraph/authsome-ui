/**
 * Multi-Factor Authentication (MFA) renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { TwoFactorMethod, defaultLocale } from '@authsome/ui-core';

export interface MFARendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

export function MFARequiredRenderer({
  onNext,
  uiComponents,
  rendererConfig,
}: {
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}) {
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};
  
  const ShieldIcon = icons?.shield;
  const locale = rendererConfig?.locale || defaultLocale;

  return (
    <div className="space-y-6 text-center py-6">
      {ShieldIcon && <ShieldIcon className="mx-auto h-16 w-16 text-blue-600" />}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{locale.mfa?.required || 'Two-Factor Authentication Required'}</h2>
        <p className="text-gray-600 mt-2">
          Your account is protected with 2FA. Please verify your identity to continue.
        </p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="info">
          <AlertDescription>
            This extra step helps keep your account secure.
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={() => onNext()} className="w-full">
        {locale.common?.continue || 'Continue to Verification'}
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
  rendererConfig,
}: MFARendererProps) {
  const { Button } = uiComponents;
  const methods = state.mfaMethods || ['totp', 'sms'];
  const locale = rendererConfig?.locale || defaultLocale;

  const methodConfig: Record<string, { name: string; description: string; icon: string }> = {
    totp: { name: 'Authenticator App', description: 'Use your authenticator app', icon: '🔐' },
    sms: { name: 'SMS Code', description: 'Receive a code via SMS', icon: '📱' },
    email: { name: 'Email Code', description: 'Receive a code via email', icon: '📧' },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">{locale.mfa?.selectMethod || 'Choose Verification Method'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Select how you&apos;d like to verify your identity
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
          {locale.common?.back || 'Back'}
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
  rendererConfig,
}: MFARendererProps) {
  const { verifyTwoFactor } = useAuth();
  const { Input, Button, Alert: AlertComponents, Field } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};
  
  const locale = rendererConfig?.locale || defaultLocale;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verifyTwoFactor) {
      setError(locale.errors?.generic || 'Two-factor authentication is not available');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifyTwoFactor({
        code,
        method: (state.metadata?.mfaMethod as TwoFactorMethod) || 'totp',
      });
      
      // Auth state is updated internally, just move to next step
      await onNext();
    } catch (err: any) {
      setError(err.message || locale.validation?.codeInvalid || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{locale.mfa?.enterCode || 'Enter Verification Code'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="code">{locale.mfa?.verify || 'Authentication Code'}</Field.FieldLabel>
        <Input
            id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder={locale.placeholders?.code || '000000'}
          maxLength={6}
          required
          disabled={loading || isLoading}
          className="text-center text-2xl tracking-widest"
          autoFocus
            aria-invalid={!!error}
        />
        </Field.Field>

        <div className="flex gap-2">
          {onBack && (
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              disabled={loading || isLoading}
            >
              {locale.common?.back || 'Back'}
            </Button>
          )}
          <Button
            type="submit"
            loading={loading || isLoading}
            className="flex-1"
          >
            {locale.mfa?.verify || 'Verify'}
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

