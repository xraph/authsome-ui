/**
 * Error screen renderer
 */

import { AuthErrorType, defaultLocale } from '@authsome/ui-core';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { AuthError } from '@authsome/ui-core';

export interface ErrorRendererProps {
  error: AuthError;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorRenderer({
  error,
  uiComponents,
  rendererConfig,
  onRetry,
  onBack,
}: ErrorRendererProps) {
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};
  
  const ErrorIcon = icons?.error;
  const locale = rendererConfig?.locale || defaultLocale;

  const getErrorTitle = (error: AuthError): string => {
    const titles = locale.errors;
    if (!titles) return error.message || 'Error';
    
    switch (error.type) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return titles.invalidCredentials || 'Invalid Credentials';
      case AuthErrorType.USER_NOT_FOUND:
        return titles.userNotFound || 'User Not Found';
      case AuthErrorType.USER_ALREADY_EXISTS:
        return titles.userExists || 'Account Already Exists';
      case AuthErrorType.INVALID_TOKEN:
      case AuthErrorType.TOKEN_EXPIRED:
        return titles.tokenExpired || 'Session Expired';
      case AuthErrorType.NETWORK_ERROR:
        return titles.networkError || 'Connection Error';
      case AuthErrorType.RATE_LIMIT_EXCEEDED:
        return titles.rateLimitExceeded || 'Too Many Attempts';
      case AuthErrorType.MFA_REQUIRED:
        return titles.mfaRequired || 'Verification Required';
      case AuthErrorType.EMAIL_NOT_VERIFIED:
        return titles.emailNotVerified || 'Email Not Verified';
      default:
        return titles.generic || 'Authentication Failed';
    }
  };

  const getErrorMessage = (error: AuthError): string => {
    if (error.message) {
      return error.message;
    }

    const messages = locale.errors;
    if (!messages) return 'An error occurred';

    switch (error.type) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return messages.invalidCredentials || 'The email or password you entered is incorrect. Please try again.';
      case AuthErrorType.USER_NOT_FOUND:
        return messages.userNotFound || 'No account found with this email address. Please sign up first.';
      case AuthErrorType.USER_ALREADY_EXISTS:
        return messages.userExists || 'An account with this email already exists. Please sign in instead.';
      case AuthErrorType.TOKEN_EXPIRED:
        return messages.tokenExpired || 'Your session has expired. Please sign in again.';
      case AuthErrorType.NETWORK_ERROR:
        return messages.networkError || 'Unable to connect. Please check your internet connection and try again.';
      case AuthErrorType.RATE_LIMIT_EXCEEDED:
        return messages.rateLimitExceeded || 'Too many login attempts. Please wait a few minutes and try again.';
      case AuthErrorType.EMAIL_NOT_VERIFIED:
        return messages.emailNotVerified || 'Please verify your email address before signing in.';
      default:
        return messages.generic || 'An unexpected error occurred. Please try again.';
    }
  };

  const getErrorHelp = (error: AuthError): string | null => {
    switch (error.type) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'Forgot your password? Use the password reset link.';
      case AuthErrorType.USER_NOT_FOUND:
        return 'New here? Create an account to get started.';
      case AuthErrorType.RATE_LIMIT_EXCEEDED:
        return 'For security reasons, we limit login attempts. Please try again in 15 minutes.';
      case AuthErrorType.EMAIL_NOT_VERIFIED:
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

      {Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>
            <div className="text-left">
              <p className="font-medium">Error Code: {error.type}</p>
              {error.code && (
                <p className="text-sm mt-1">Reference: {error.code}</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {getErrorHelp(error) && (
        <p className="text-sm text-gray-600">{getErrorHelp(error)}</p>
      )}

      <div className="space-y-2">
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            {locale.common?.continue || 'Try Again'}
          </Button>
        )}
        {onBack && (
          <Button onClick={onBack} variant="outline" className="w-full">
            {locale.common?.back || 'Go Back'}
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Still having issues? <a href="/support" className="text-blue-600 hover:underline">Contact Support</a>
      </p>
    </div>
  );
}

