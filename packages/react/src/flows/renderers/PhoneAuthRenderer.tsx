/**
 * Phone authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { FlowState } from '@authsome/ui-core';

export interface PhoneAuthRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
}

export function PhoneAuthRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
}: PhoneAuthRendererProps) {
  const { requestPhoneAuth } = useAuth();
  const { Input, Button, Alert, icons } = uiComponents;
  const PhoneIcon = icons?.phone;

  const [phone, setPhone] = useState(state.phone || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPhoneAuth({ phone });
      await onNext({ phone });
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {PhoneIcon && <PhoneIcon className="mx-auto h-12 w-12 text-blue-600" />}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Phone Verification</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your phone number to receive a verification code
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="tel"
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          required
          disabled={loading || isLoading}
          helperText="Include country code"
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
            Send Code
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
}: PhoneAuthRendererProps) {
  const { verifyPhoneAuth } = useAuth();
  const { Input, Button, Alert } = uiComponents;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await verifyPhoneAuth({ phone: state.phone!, code });
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
          We sent a 6-digit code to {state.phone}
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          required
          disabled={loading || isLoading}
          className="text-center text-2xl tracking-widest"
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
    </div>
  );
}

