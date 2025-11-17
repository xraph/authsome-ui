/**
 * Magic Link authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { FlowState } from '@authsome/ui-core';

export interface MagicLinkRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
}

export function MagicLinkRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
}: MagicLinkRendererProps) {
  const { sendMagicLink } = useAuth();
  const { Input, Button, Alert, icons } = uiComponents;
  const MailIcon = icons?.mail;

  const [email, setEmail] = useState(state.email || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendMagicLink({ email });
      await onNext({ email });
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {MailIcon && <MailIcon className="mx-auto h-12 w-12 text-blue-600" />}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Magic Link</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your email to receive a magic link
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          disabled={loading || isLoading}
          helperText="We'll send you a secure link to sign in"
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
            Send Magic Link
          </Button>
        </div>
      </form>
    </div>
  );
}

export function MagicLinkSentRenderer({
  state,
  uiComponents,
}: {
  state: FlowState;
  uiComponents: UIComponents;
}) {
  const { Alert, icons } = uiComponents;
  const MailIcon = icons?.mail;

  return (
    <div className="space-y-6 text-center py-6">
      {MailIcon && <MailIcon className="mx-auto h-16 w-16 text-blue-600" />}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Check Your Email</h2>
        <p className="text-gray-600 mt-2">
          We sent a magic link to
        </p>
        <p className="font-semibold mt-1">{state.email}</p>
      </div>

      {Alert && (
        <Alert variant="info">
          Click the link in the email to sign in. The link will expire in 15 minutes.
        </Alert>
      )}

      <p className="text-sm text-gray-600">
        Didn&apos;t receive the email? Check your spam folder or try again.
      </p>
    </div>
  );
}

