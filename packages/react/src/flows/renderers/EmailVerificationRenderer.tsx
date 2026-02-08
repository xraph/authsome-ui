/**
 * Email Verification renderers
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { defaultLocale } from '@authsome/ui-core';

export interface EmailVerificationRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

/**
 * Email Verification Required - Prompt user to verify their email
 */
export function EmailVerificationRequiredRenderer({
  state,
  onNext,
  isLoading,
  uiComponents,
  rendererConfig,
}: EmailVerificationRendererProps) {
  const { sendVerificationEmail } = useAuth();
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const MailIcon = icons?.mail;
  const locale = rendererConfig?.locale || defaultLocale;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setError(null);
    setLoading(true);

    try {
      if (sendVerificationEmail) {
        await sendVerificationEmail({ email: state.email || '' });
      }
      await onNext();
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      {MailIcon ? (
        <MailIcon className="mx-auto h-16 w-16 text-blue-600" />
      ) : (
        <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-3xl">📧</span>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mt-2">
          Please verify your email address to continue
        </p>
        {state.email && (
          <p className="font-semibold mt-1">{state.email}</p>
        )}
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        onClick={handleSendEmail}
        loading={loading || isLoading}
        className="w-full"
      >
        Send Verification Email
      </Button>
    </div>
  );
}

/**
 * Email Verification Sent - Confirmation that verification email was sent
 */
export function EmailVerificationSentRenderer({
  state,
  onNext: _onNext,
  isLoading,
  uiComponents,
  rendererConfig,
}: EmailVerificationRendererProps) {
  const { resendVerificationEmail } = useAuth();
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  const MailIcon = icons?.mail;
  const locale = rendererConfig?.locale || defaultLocale;

  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const handleResend = async () => {
    setError(null);
    setResendLoading(true);
    try {
      if (resendVerificationEmail && state.email) {
        await resendVerificationEmail({ email: state.email });
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : locale.errors?.generic ?? 'Failed to resend verification email'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center py-6">
      {MailIcon ? (
        <MailIcon className="mx-auto h-16 w-16 text-green-600" />
      ) : (
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-3xl">✉️</span>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Check Your Email</h2>
        <p className="text-gray-600 mt-2">
          We&apos;ve sent a verification link to
        </p>
        <p className="font-semibold mt-1">{state.email}</p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="info">
          <AlertDescription>
            Click the link in the email to verify your account. The link will expire in 24 hours.
          </AlertDescription>
        </Alert>
      )}

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-gray-600">
        Didn&apos;t receive the email? Check your spam folder or try again.
      </p>

      {resendVerificationEmail && state.email && (
        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          loading={resendLoading || isLoading}
          className="w-full"
        >
          Resend verification email
        </Button>
      )}
    </div>
  );
}

/**
 * Email Verification Code - User enters verification code
 */
export function EmailVerificationCodeRenderer({
  state,
  onNext,
  isLoading,
  uiComponents,
  rendererConfig,
}: EmailVerificationRendererProps) {
  const { verifyEmail } = useAuth();
  const { Input, Button, Alert: AlertComponents, Field, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const LockIcon = icons?.key;
  const locale = rendererConfig?.locale || defaultLocale;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      setError(locale.validation?.codeRequired || 'Verification code is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (verifyEmail) {
        await verifyEmail({ token: code });
      }
      await onNext();
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {LockIcon ? (
          <LockIcon className="mx-auto h-12 w-12 text-blue-600" />
        ) : (
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">🔢</span>
          </div>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          Enter Verification Code
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter the code we sent to {state.email}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="code">{locale.phone?.codeLabel || 'Verification Code'}</Field.FieldLabel>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={locale.placeholders?.code || '123456'}
            required
            disabled={loading || isLoading}
            aria-invalid={!!error}
            autoComplete="one-time-code"
          />
        </Field.Field>

        <Button
          type="submit"
          loading={loading || isLoading}
          className="w-full"
        >
          Verify Email
        </Button>
      </form>
    </div>
  );
}

/**
 * Email Verification Link - Processing verification from link click
 */
export function EmailVerificationLinkRenderer({
  state,
  onNext,
  isLoading,
  uiComponents,
  rendererConfig,
}: EmailVerificationRendererProps) {
  const { verifyEmail } = useAuth();
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const LoadingIcon = icons?.loading;
  const SuccessIcon = icons?.success;
  const locale = rendererConfig?.locale || defaultLocale;

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const verifyToken = async () => {
      if (!state.token) {
        setStatus('error');
        setError('Invalid verification link');
        return;
      }

      try {
        if (verifyEmail) {
          await verifyEmail({ token: state.token });
        }
        setStatus('success');
        // Auto-proceed after a short delay
        setTimeout(() => {
          onNext();
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || locale.errors?.invalidToken || 'Invalid or expired verification link');
      }
    };

    verifyToken();
  }, [state.token, verifyEmail, onNext, locale.errors?.invalidToken]);

  if (status === 'verifying') {
    return (
      <div className="space-y-6 text-center py-8">
        {LoadingIcon ? (
          <LoadingIcon className="mx-auto h-16 w-16 text-blue-600 animate-spin" />
        ) : (
          <div className="mx-auto h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verifying Your Email</h2>
          <p className="text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-6 text-center py-8">
        {SuccessIcon ? (
          <SuccessIcon className="mx-auto h-16 w-16 text-green-500" />
        ) : (
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-green-700">
            Email Verified!
          </h2>
          <p className="text-gray-600 mt-2">
            {locale.success?.verified || 'Your email has been successfully verified'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center py-8">
      <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-3xl">✗</span>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-red-700">
          Verification Failed
        </h2>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>
            The verification link may have expired or is invalid. Please request a new verification email.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        onClick={() => window.location.reload()}
        loading={isLoading}
        className="w-full"
      >
        Try Again
      </Button>
    </div>
  );
}

