/**
 * Password Reset renderers
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { defaultLocale } from '@authsome/ui-core';

export interface PasswordResetRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

/**
 * Password Reset Request - User enters email to request reset
 */
export function PasswordResetRequestRenderer({
  state,
  onNext,
  onBack: _onBack,
  isLoading,
  uiComponents,
  rendererConfig,
}: PasswordResetRendererProps) {
  const { requestPasswordReset } = useAuth();
  const { Input, Button, Alert: AlertComponents, Field, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const MailIcon = icons?.mail;
  const locale = rendererConfig?.locale || defaultLocale;
  const signInUrl = rendererConfig?.signUp?.signInUrl || '/auth/signin';

  const [email, setEmail] = useState(state.email || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(locale.validation?.emailRequired || 'Email is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (requestPasswordReset) {
        await requestPasswordReset({ email });
      }
      await onNext({ email });
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {MailIcon ? (
          <MailIcon className="mx-auto h-12 w-12 text-blue-600" />
        ) : (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          {locale.auth?.forgotPassword || 'Forgot Password?'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your email and we&apos;ll send you a reset link
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
        </Field.Field>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            loading={loading || isLoading}
            className="w-full"
          >
            Send Reset Link
          </Button>
        </div>
      </form>

      {/* Back to Sign In link */}
      <p className="text-center text-sm text-gray-600">
        <a 
          href={signInUrl} 
          className="font-medium text-primary hover:underline"
        >
          ← {locale.common?.back || 'Back to Sign In'}
        </a>
      </p>
    </div>
  );
}

/**
 * Password Reset Sent - Confirmation that email was sent
 */
export function PasswordResetSentRenderer({
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
  const MailIcon = icons?.mail;
  const locale = rendererConfig?.locale || defaultLocale;
  const signInUrl = rendererConfig?.signUp?.signInUrl || '/auth/signin';

  return (
    <div className="space-y-6 text-center py-6">
      {MailIcon ? (
        <MailIcon className="mx-auto h-16 w-16 text-blue-600" />
      ) : (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Check Your Email</h2>
        <p className="text-gray-600 mt-2">
          We&apos;ve sent a password reset link to
        </p>
        <p className="font-semibold mt-1">{state.email}</p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="info">
          <AlertDescription>
            Click the link in the email to reset your password. The link will expire in 24 hours.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-gray-600">
        Didn&apos;t receive the email? Check your spam folder or try again.
      </p>

      {/* Back to Sign In link */}
      <p className="text-center text-sm text-gray-600">
        <a 
          href={signInUrl} 
          className="font-medium text-primary hover:underline"
        >
          ← {locale.common?.back || 'Back to Sign In'}
        </a>
      </p>
    </div>
  );
}

/**
 * Password Reset Confirm - User enters new password
 */
export function PasswordResetConfirmRenderer({
  state,
  onNext,
  isLoading,
  uiComponents,
  rendererConfig,
}: PasswordResetRendererProps) {
  const { confirmPasswordReset } = useAuth();
  const { Input, Button, Alert: AlertComponents, Field, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const LockIcon = icons?.lock;
  const locale = rendererConfig?.locale || defaultLocale;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError(locale.validation?.passwordRequired || 'Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError(locale.validation?.passwordMismatch || 'Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (confirmPasswordReset) {
        // Token should be passed via state from the reset link
        await confirmPasswordReset({ 
          token: state.token || '', 
          password 
        });
      }
      await onNext();
    } catch (err: any) {
      setError(err.message || locale.errors?.generic || 'Failed to reset password');
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your new password below
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="password">{locale.auth?.password || 'New Password'}</Field.FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={locale.placeholders?.password || 'Enter new password'}
            required
            disabled={loading || isLoading}
            aria-invalid={!!error}
          />
        </Field.Field>

        <Field.Field>
          <Field.FieldLabel htmlFor="confirmPassword">{locale.auth?.confirmPassword || 'Confirm Password'}</Field.FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={locale.placeholders?.confirmPassword || 'Confirm new password'}
            required
            disabled={loading || isLoading}
            aria-invalid={!!error}
          />
        </Field.Field>

        <Button
          type="submit"
          loading={loading || isLoading}
          className="w-full"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}

