/**
 * Magic Link authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { defaultLocale } from '@authsome/ui-core';

export interface MagicLinkRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

export function MagicLinkRenderer({
  state,
  onNext,
  onBack: _onBack,
  isLoading,
  uiComponents,
  rendererConfig,
}: MagicLinkRendererProps) {
  const { sendMagicLink } = useAuth();
  const { Input, Button, Alert: AlertComponents, Field, icons } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};
  
  const MagicLinkIcon = icons?.magicLink || icons?.mail;
  const locale = rendererConfig?.locale || defaultLocale;

  const [email, setEmail] = useState(state.email || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendMagicLink) {
      setError(locale.errors?.generic || 'Magic link is not available');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await sendMagicLink({ email });
      await onNext({ email });
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {MagicLinkIcon ? (
          <MagicLinkIcon className="mx-auto h-12 w-12 text-blue-600" />
        ) : (
          <span className="text-6xl" />
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{locale.magicLink?.sendLink || 'Magic Link'}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {locale.magicLink?.enterEmail || 'Enter your email to receive a magic link'}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="email">{locale.auth?.email || 'Email Address'}</Field.FieldLabel>
        <Input
            id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={locale.placeholders?.email || 'john@example.com'}
          required
          disabled={loading || isLoading}
            aria-invalid={!!error}
          />
          <Field.FieldDescription>
            We&apos;ll send you a secure link to sign in
          </Field.FieldDescription>
        </Field.Field>

          <Button
            type="submit"
            loading={loading || isLoading}
          className="w-full"
          >
            {locale.magicLink?.sendLink || 'Send Magic Link'}
          </Button>
      </form>
    </div>
  );
}

export function MagicLinkSentRenderer({
  state,
  uiComponents,
  rendererConfig,
}: {
  state: FlowState;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}) {
  const { Alert: AlertComponents, icons } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  const MagicLinkIcon = icons?.magicLink || icons?.mail;
  const locale = rendererConfig?.locale || defaultLocale;

  return (
    <div className="space-y-6 text-center py-6">
      {MagicLinkIcon ? (
        <MagicLinkIcon className="mx-auto h-16 w-16 text-blue-600" />
      ) : (
        <span className="text-6xl" />
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{locale.magicLink?.checkEmail || 'Check Your Email'}</h2>
        <p className="text-gray-600 mt-2">
          {locale.magicLink?.linkSent || 'We sent a magic link to'}
        </p>
        <p className="font-semibold mt-1">{state.email}</p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="info">
          <AlertDescription>
            Click the link in the email to sign in. The link will expire in 15 minutes.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-gray-600">
        Didn&apos;t receive the email? Check your spam folder or try again.
      </p>
    </div>
  );
}
