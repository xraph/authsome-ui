/**
 * Device Flow authentication renderers
 * Implements RFC 8628 - OAuth 2.0 Device Authorization Grant
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState } from '@authsome/ui-core';
import { defaultLocale } from '@authsome/ui-core';

export interface DeviceFlowRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  onCancel?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}

/**
 * Format user code with dash separator (e.g., "BCDF-GHJK")
 */
function formatUserCode(code: string): string {
  const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (cleaned.length <= 4) {
    return cleaned;
  }
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
}

/**
 * Parse user code input, removing dashes and converting to uppercase
 */
function parseUserCode(input: string): string {
  return input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

/**
 * Device Code Entry Renderer
 * Shows form for user to enter the device code displayed on their CLI/device
 */
export function DeviceCodeEntryRenderer({
  state,
  onNext,
  onBack: _onBack,
  isLoading,
  uiComponents,
  rendererConfig,
}: DeviceFlowRendererProps) {
  const { verifyDeviceCode } = useAuth();
  const { Input, Button, Alert: AlertComponents, Field, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const DeviceIcon = icons?.device || icons?.key;
  const locale = rendererConfig?.locale || defaultLocale;

  const [userCode, setUserCode] = useState(state.userCode || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseUserCode(e.target.value);
    // Limit to 8 characters (the max user code length)
    if (value.length <= 8) {
      setUserCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifyDeviceCode) {
      setError('Device flow is not available');
      return;
    }

    const cleanedCode = parseUserCode(userCode);
    if (cleanedCode.length < 8) {
      setError('Please enter the complete 8-character code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await verifyDeviceCode({ userCode: cleanedCode });
      
      if (!result.valid) {
        setError('Invalid code. Please check and try again.');
        setLoading(false);
        return;
      }
      
      await onNext({ 
        userCode: cleanedCode,
        deviceScopes: result.scopes,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid device code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {DeviceIcon ? (
          <DeviceIcon className="mx-auto h-12 w-12 text-blue-600" />
        ) : (
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">📱</span>
          </div>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          {locale.deviceFlow?.enterCode || 'Enter Device Code'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {locale.deviceFlow?.enterCodeDescription || 
            'Enter the code displayed on your device or CLI'}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field.Field>
          <Field.FieldLabel htmlFor="userCode">
            {locale.deviceFlow?.codeLabel || 'Device Code'}
          </Field.FieldLabel>
          <Input
            id="userCode"
            type="text"
            autoFocus
            value={formatUserCode(userCode)}
            onChange={handleInputChange}
            placeholder="XXXX-XXXX"
            required
            disabled={loading || isLoading}
            aria-invalid={!!error}
            className="text-center text-2xl tracking-widest font-mono uppercase"
            maxLength={9} // 8 characters + 1 dash
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          <Field.FieldDescription>
            {locale.deviceFlow?.codeHint || 
              'The code should be 8 characters, like BCDF-GHJK'}
          </Field.FieldDescription>
        </Field.Field>

        <Button
          type="submit"
          loading={loading || isLoading}
          className="w-full"
        >
          {locale.deviceFlow?.verifyCode || 'Verify Code'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {locale.deviceFlow?.noCode || "Don't have a code?"}{' '}
        <span className="text-gray-600">
          {locale.deviceFlow?.getCodeHelp || 
            'Run the CLI command to get a new code.'}
        </span>
      </p>
    </div>
  );
}

/**
 * Device Authorize Renderer
 * Shows consent screen for user to approve or deny device access
 */
export function DeviceAuthorizeRenderer({
  state,
  onNext,
  onCancel,
  isLoading,
  uiComponents,
  rendererConfig,
}: DeviceFlowRendererProps) {
  const { authorizeDevice } = useAuth();
  const { Button, Alert: AlertComponents, icons } = uiComponents;
  
  const { Alert, AlertDescription } = AlertComponents || {};
  const CheckIcon = icons?.check;
  const XIcon = icons?.close;
  const locale = rendererConfig?.locale || defaultLocale;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!authorizeDevice || !state.userCode) {
      setError('Unable to authorize device');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authorizeDevice({ 
        userCode: state.userCode, 
        action: 'approve' 
      });
      // Transition to success state
      await onNext({ 
        deviceAuthorized: true,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to authorize device';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!authorizeDevice || !state.userCode) {
      setError('Unable to deny device');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authorizeDevice({ 
        userCode: state.userCode, 
        action: 'deny' 
      });
      // Transition to denied state
      if (onCancel) {
        await onCancel();
      } else {
        await onNext({
          deviceAuthorized: false,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deny device';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100">
          <span className="text-3xl">🔐</span>
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          {locale.deviceFlow?.authorizeTitle || 'Authorize Device'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {locale.deviceFlow?.authorizeDescription || 
            'A device is requesting access to your account'}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            {locale.deviceFlow?.codeConfirm || 'Confirm this is your code:'}
          </p>
          <p className="text-2xl font-mono font-bold mt-2">
            {formatUserCode(state.userCode || '')}
          </p>
        </div>

        {state.deviceScopes && state.deviceScopes.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {locale.deviceFlow?.requestedPermissions || 'Requested permissions:'}
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {state.deviceScopes.map((scope, index) => (
                <li key={index}>{scope}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {Alert && AlertDescription && (
        <Alert variant="warning">
          <AlertDescription>
            {locale.deviceFlow?.securityWarning || 
              'Only approve if you initiated this request. If you did not request this authorization, click Deny.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleDeny}
          loading={loading}
          disabled={isLoading}
          className="flex-1"
        >
          {XIcon && <XIcon className="mr-2 h-4 w-4" />}
          {locale.deviceFlow?.deny || 'Deny'}
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          loading={loading}
          disabled={isLoading}
          className="flex-1"
        >
          {CheckIcon && <CheckIcon className="mr-2 h-4 w-4" />}
          {locale.deviceFlow?.approve || 'Approve'}
        </Button>
      </div>
    </div>
  );
}

/**
 * Device Authorized Success Renderer
 * Shows confirmation that the device has been authorized
 */
export function DeviceAuthorizedRenderer({
  uiComponents,
  rendererConfig,
}: {
  state: FlowState;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}) {
  const { Alert: AlertComponents, icons } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  const CheckIcon = icons?.check;
  const locale = rendererConfig?.locale || defaultLocale;

  return (
    <div className="space-y-6 text-center py-6">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
        {CheckIcon ? (
          <CheckIcon className="h-8 w-8 text-green-600" />
        ) : (
          <span className="text-3xl">✓</span>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-green-600">
          {locale.deviceFlow?.authorizedTitle || 'Device Authorized'}
        </h2>
        <p className="text-gray-600 mt-2">
          {locale.deviceFlow?.authorizedDescription || 
            'You have successfully authorized the device. You can now close this window.'}
        </p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="success">
          <AlertDescription>
            {locale.deviceFlow?.authorizedHint || 
              'Return to your device or CLI to continue.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Device Denied Renderer
 * Shows confirmation that the device authorization was denied
 */
export function DeviceDeniedRenderer({
  uiComponents,
  rendererConfig,
}: {
  state: FlowState;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
}) {
  const { Alert: AlertComponents, icons } = uiComponents;
  const { Alert, AlertDescription } = AlertComponents || {};
  const XIcon = icons?.close;
  const locale = rendererConfig?.locale || defaultLocale;

  return (
    <div className="space-y-6 text-center py-6">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
        {XIcon ? (
          <XIcon className="h-8 w-8 text-red-600" />
        ) : (
          <span className="text-3xl">✗</span>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-red-600">
          {locale.deviceFlow?.deniedTitle || 'Access Denied'}
        </h2>
        <p className="text-gray-600 mt-2">
          {locale.deviceFlow?.deniedDescription || 
            'You have denied the device authorization request.'}
        </p>
      </div>

      {Alert && AlertDescription && (
        <Alert variant="info">
          <AlertDescription>
            {locale.deviceFlow?.deniedHint || 
              'If this was a mistake, you can start a new authorization request from your device.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
