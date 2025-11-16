/**
 * Error screen renderer
 */

import React from 'react';
import type { UIComponents } from '../ui-components';
import type { AuthError } from '@authsome/ui-core';

export interface ErrorRendererProps {
  error: AuthError;
  uiComponents: UIComponents;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorRenderer({
  error,
  uiComponents,
  onRetry,
  onBack,
}: ErrorRendererProps) {
  const { Button, Alert, icons } = uiComponents;
  const ErrorIcon = icons?.error;

  const getErrorTitle = (error: AuthError): string => {
    switch (error.type) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid Credentials';
      case 'USER_NOT_FOUND':
        return 'User Not Found';
      case 'USER_ALREADY_EXISTS':
        return 'Account Already Exists';
      case 'INVALID_TOKEN':
      case 'TOKEN_EXPIRED':
        return 'Session Expired';
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too Many Attempts';
      case 'MFA_REQUIRED':
        return 'Verification Required';
      case 'EMAIL_NOT_VERIFIED':
        return 'Email Not Verified';
      default:
        return 'Authentication Failed';
    }
  };

  const getErrorMessage = (error: AuthError): string => {
    if (error.message) {
      return error.message;
    }

    switch (error.type) {
      case 'INVALID_CREDENTIALS':
        return 'The email or password you entered is incorrect. Please try again.';
      case 'USER_NOT_FOUND':
        return 'No account found with this email address. Please sign up first.';
      case 'USER_ALREADY_EXISTS':
        return 'An account with this email already exists. Please sign in instead.';
      case 'TOKEN_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection and try again.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many login attempts. Please wait a few minutes and try again.';
      case 'EMAIL_NOT_VERIFIED':
        return 'Please verify your email address before signing in.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const getErrorHelp = (error: AuthError): string | null => {
    switch (error.type) {
      case 'INVALID_CREDENTIALS':
        return 'Forgot your password? Use the password reset link.';
      case 'USER_NOT_FOUND':
        return 'New here? Create an account to get started.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'For security reasons, we limit login attempts. Please try again in 15 minutes.';
      case 'EMAIL_NOT_VERIFIED':
        return 'Check your inbox for a verification email we sent you.';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-center py-6">
      {ErrorIcon ? (
        <ErrorIcon className="mx-auto h-16 w-16 text-red-500" />
      ) : (
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-4xl text-red-500">✗</span>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{getErrorTitle(error)}</h2>
        <p className="text-gray-600 mt-2">{getErrorMessage(error)}</p>
      </div>

      {Alert && (
        <Alert variant="error">
          <div className="text-left">
            <p className="font-medium">Error Code: {error.type}</p>
            {error.code && (
              <p className="text-sm mt-1">Reference: {error.code}</p>
            )}
          </div>
        </Alert>
      )}

      {getErrorHelp(error) && (
        <p className="text-sm text-gray-600">{getErrorHelp(error)}</p>
      )}

      <div className="space-y-2">
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
        )}
        {onBack && (
          <Button onClick={onBack} variant="outline" className="w-full">
            Go Back
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Still having issues? <a href="/support" className="text-blue-600 hover:underline">Contact Support</a>
      </p>
    </div>
  );
}

