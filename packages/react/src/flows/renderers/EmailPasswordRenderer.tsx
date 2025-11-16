/**
 * Email/Password authentication renderer
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { FlowState } from '@authsome/ui-core';

export interface EmailPasswordRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  mode?: 'signin' | 'signup';
}

export function EmailPasswordRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  mode = 'signin',
}: EmailPasswordRendererProps) {
  const { signIn, signUp } = useAuth();
  const { Input, Button, Alert, Link } = uiComponents;

  const [email, setEmail] = useState(state.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = mode === 'signin'
        ? await signIn({ email, password })
        : await signUp({ email, password });

      await onNext({
        user: result.user,
        session: result.session,
        email,
        mfaRequired: result.mfaRequired,
      });
    } catch (err: any) {
      setError(err.message || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'signin'
            ? 'Enter your email and password to sign in'
            : 'Enter your details to create a new account'}
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          disabled={loading || isLoading}
        />

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={loading || isLoading}
          helperText={mode === 'signup' ? 'At least 8 characters' : undefined}
        />

        {mode === 'signup' && (
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading || isLoading}
          />
        )}

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
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>

        {mode === 'signin' && Link && (
          <div className="text-center text-sm">
            <Link href="/forgot-password">Forgot your password?</Link>
          </div>
        )}
      </form>
    </div>
  );
}

