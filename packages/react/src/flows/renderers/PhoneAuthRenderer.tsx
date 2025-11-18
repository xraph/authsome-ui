/**
 * Phone authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { defaultLocale } from '@authsome/ui-core';

export interface PhoneAuthRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

export function PhoneAuthRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  rendererConfig,
}: PhoneAuthRendererProps) {
  const { sendPhoneCode } = useAuth();
  const { Input, Button, Alert, Field, icons } = uiComponents;
  const PhoneIcon = icons?.phone;
  const locale = rendererConfig?.locale || defaultLocale;

  const [phone, setPhone] = useState(state.phone || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPhoneCode?.({ phone });
      await onNext({ phone });
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {PhoneIcon && <PhoneIcon className="mx-auto h-12 w-12 text-blue-600" />}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{locale.phone?.verifyPhone || 'Phone Verification'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {locale.phone?.enterPhone || 'Enter your phone number to receive a verification code'}
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="phone">{locale.auth?.phone || 'Phone Number'}</Field.FieldLabel>
        <Input
            id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={locale.placeholders?.phone || '+1 (555) 000-0000'}
          required
          disabled={loading || isLoading}
            aria-invalid={!!error}
        />
          <Field.FieldDescription>Include country code</Field.FieldDescription>
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
            {locale.phone?.sendCode || 'Send Code'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function PhoneVerifyRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  rendererConfig,
}: PhoneAuthRendererProps) {
  const { verifyPhoneCode } = useAuth();
  const { Input, Button, Alert, Field } = uiComponents;
  const locale = rendererConfig?.locale || defaultLocale;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyPhoneCode?.({ phone: state.phone!, code });
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
        <h2 className="text-2xl font-bold tracking-tight">{locale.phone?.enterCode || 'Enter Verification Code'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          We sent a 6-digit code to {state.phone}
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="code">{locale.phone?.codeLabel || 'Verification Code'}</Field.FieldLabel>
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
    </div>
  );
}
