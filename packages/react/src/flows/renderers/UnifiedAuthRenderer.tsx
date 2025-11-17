/**
 * Unified authentication renderer
 * 
 * Shows all enabled auth methods (email, OAuth, magic link, etc.) in one view
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig, CustomField } from '../renderer-config';
import type { FlowState, OAuthProvider } from '@authsome/ui-core';

export interface UnifiedAuthRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
  mode: 'signin' | 'signup';
}

export function UnifiedAuthRenderer({
  state,
  onNext,
  onBack,
  isLoading,
  uiComponents,
  rendererConfig,
  mode,
}: UnifiedAuthRendererProps) {
  const { signIn, signUp, oauthSignIn, sendMagicLink, sendPhoneCode, authenticatePasskey } = useAuth();
  const { Input, Button, Alert, Divider, Checkbox, Select, Textarea, Label } = uiComponents;

  const [formData, setFormData] = useState<Record<string, any>>({
    email: state.email || '',
    password: '',
    confirmPassword: '',
    phone: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const config = rendererConfig || {};
  const authMethods = config.authMethods || {};
  const signUpConfig = config.signUp || {};
  const signInConfig = config.signIn || {};
  const labels = config.labels || {};

  // Validate custom fields
  const validateCustomFields = (): string | null => {
    if (mode !== 'signup' || !signUpConfig.customFields) return null;

    for (const field of signUpConfig.customFields) {
      const value = formData[field.name];

      if (field.required && !value) {
        return field.errorMessage || `${field.label} is required`;
      }

      if (field.pattern && value && !field.pattern.test(value)) {
        return field.errorMessage || `${field.label} is invalid`;
      }

      if (field.minLength && value && value.length < field.minLength) {
        return `${field.label} must be at least ${field.minLength} characters`;
      }

      if (field.maxLength && value && value.length > field.maxLength) {
        return `${field.label} must be at most ${field.maxLength} characters`;
      }
    }

    return null;
  };

  // Handle email/password submit
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (mode === 'signup' && signUpConfig.showTermsCheckbox && !agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    // Validate custom fields
    const customFieldError = validateCustomFields();
    if (customFieldError) {
      setError(customFieldError);
      return;
    }

    // Custom validation
    if (mode === 'signup' && signUpConfig.validate) {
      const validationError = signUpConfig.validate(formData);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    try {
      const result = mode === 'signin'
        ? await signIn({ email: formData.email, password: formData.password })
        : await signUp({ 
            email: formData.email, 
            password: formData.password,
            ...formData, // Include custom fields
          });

      await onNext({
        user: result.user,
        session: result.session,
        email: formData.email,
        mfaRequired: result.mfaRequired,
      });
    } catch (err: any) {
      setError(err.message || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth
  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setLoading(true);

    try {
      const result = await oauthSignIn({
        provider,
        redirectUri: window.location.origin + '/auth/callback',
      });
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        await onNext({ oauthProvider: provider });
      }
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  // Handle Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (sendMagicLink) {
        await sendMagicLink({ email: formData.email });
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  // Handle Passkey
  const handlePasskey = async () => {
    setError(null);
    setLoading(true);

    try {
      if (authenticatePasskey) {
        const result = await authenticatePasskey({});
        await onNext({
          user: result.user,
          session: result.session,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Passkey authentication failed');
      setLoading(false);
    }
  };

  // Handle Phone
  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (sendPhoneCode) {
        await sendPhoneCode({ phoneNumber: formData.phone });
        await onNext({ phone: formData.phone });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Render OAuth buttons
  const renderOAuthButtons = () => {
    if (!authMethods.oauth) return null;

    const providers = typeof authMethods.oauth === 'object' 
      ? authMethods.oauth.providers 
      : (['google', 'github'] as OAuthProvider[]);

    const providerLabels: Record<string, string> = {
      google: 'Google',
      github: 'GitHub',
      facebook: 'Facebook',
      microsoft: 'Microsoft',
      apple: 'Apple',
      discord: 'Discord',
      twitter: 'Twitter',
    };

    // Get provider icons
    const providerIcons = uiComponents.icons;

    return (
      <div className="space-y-2">
        {providers.map((provider) => {
          // Get the icon component for this provider (capitalize first letter)
          const IconComponent = providerIcons?.[provider.charAt(0).toUpperCase() + provider.slice(1) as keyof typeof providerIcons] as React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;

          return (
            <Button
              key={provider}
              onClick={() => handleOAuth(provider)}
              variant="outline"
              disabled={loading || isLoading}
              className="w-full"
              icon={IconComponent ? <IconComponent className="h-5 w-5" /> : undefined}
            >
              {labels.continueWith || 'Continue with'} {providerLabels[provider] || provider}
            </Button>
          );
        })}
      </div>
    );
  };

  // Render custom fields
  const renderCustomFields = () => {
    if (mode !== 'signup' || !signUpConfig.customFields) return null;

    return signUpConfig.customFields.map((field: CustomField) => {
      const value = formData[field.name] || field.defaultValue || '';

      if (field.type === 'select' && Select) {
        // Use composite Select (shadcn-style)
        const { Root, Trigger, Value, Content, Item } = Select;
        
        return (
          <div key={field.name} className="space-y-2">
            {field.label && Label && <Label className="text-sm font-medium">{field.label}</Label>}
            {!Label && field.label && <label className="text-sm font-medium">{field.label}</label>}
            
            <Root
              value={value}
              onValueChange={(newValue) => setFormData({ ...formData, [field.name]: newValue })}
              disabled={loading || isLoading}
            >
              <Trigger className="w-full">
                <Value placeholder={field.placeholder || 'Select...'} />
              </Trigger>
              <Content>
                {field.options?.map((opt) => (
                  <Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Item>
                ))}
              </Content>
            </Root>
            
            {field.helperText && <p className="text-xs text-gray-500">{field.helperText}</p>}
          </div>
        );
      }

      if (field.type === 'select' && !Select) {
        // Fallback to native select
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium">{field.label}</label>
            <select
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={field.required}
              disabled={loading || isLoading}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {field.helperText && <p className="text-xs text-gray-500">{field.helperText}</p>}
          </div>
        );
      }

      if (field.type === 'checkbox') {
        return (
          <div key={field.name} className="flex items-center space-x-2 gap-3">
            {Checkbox && (
              <Checkbox
                id={field.name}
                checked={!!value}
                onChange={(e: any) => setFormData({ ...formData, [field.name]: e.target.checked })}
                required={field.required}
                disabled={loading || isLoading}
              />
            )}
            {!Checkbox && (
              <input
                id={field.name}
                type="checkbox"
                checked={!!value}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                required={field.required}
                disabled={loading || isLoading}
              />
            )}
            {Label && <Label htmlFor={field.name}>{field.label}</Label>}
            {!Label && <label htmlFor={field.name}>{field.label}</label>}
          </div>
        );
      }

      if (field.type === 'textarea') {
        return (
          <div key={field.name} className="space-y-2">
            {field.label && Label && <Label className="text-sm font-medium">{field.label}</Label>}
            {!Label && field.label && <label className="text-sm font-medium">{field.label}</label>}
            
            {Textarea ? (
              <Textarea
                value={value}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading || isLoading}
                rows={4}
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading || isLoading}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            )}
            {field.helperText && <p className="text-xs text-gray-500">{field.helperText}</p>}
          </div>
        );
      }

      return (
        <Input
          key={field.name}
          type={field.type || 'text'}
          label={field.label}
          value={value}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          placeholder={field.placeholder}
          required={field.required}
          disabled={loading || isLoading}
          helperText={field.helperText}
          minLength={field.minLength}
          maxLength={field.maxLength}
          min={field.min}
          max={field.max}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === 'signin' ? (labels.signIn || 'Welcome back') : (labels.signUp || 'Create your account')}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'signin'
            ? 'Enter your credentials to sign in'
            : 'Enter your details to create a new account'}
        </p>
      </div>

      {error && Alert && (
        <Alert variant="error">{error}</Alert>
      )}

      {/* OAuth buttons (if socialFirst) */}
      {config.socialFirst && authMethods.oauth && renderOAuthButtons()}

      {/* Passkey (if socialFirst) */}
      {config.socialFirst && authMethods.passkey && (
        <Button
          onClick={handlePasskey}
          variant="outline"
          disabled={loading || isLoading}
          className="w-full"
        >
          {labels.signInWithPasskey || 'Sign in with Passkey'}
        </Button>
      )}

      {/* Divider */}
      {config.socialFirst && (authMethods.oauth || authMethods.passkey) && (authMethods.emailPassword || authMethods.magicLink || authMethods.phone || authMethods.username) && Divider && (
        <Divider label={labels.or || 'or'} />
      )}

      {/* Username/Password form */}
      {authMethods.username && (
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <Input
            type="text"
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="johndoe"
            required
            disabled={loading || isLoading}
          />

          <Input
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            disabled={loading || isLoading}
          />

          <Button
            type="submit"
            loading={loading || isLoading}
            className="w-full"
          >
            {mode === 'signin' ? (labels.signIn || 'Sign In') : (labels.signUp || 'Create Account')}
          </Button>
        </form>
      )}

      {/* Divider between username and other methods */}
      {authMethods.username && (authMethods.emailPassword || authMethods.magicLink || authMethods.phone) && Divider && (
        <Divider label={labels.or || 'or'} />
      )}

      {/* Email/Password form */}
      {authMethods.emailPassword !== false && !authMethods.username && (
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
            disabled={loading || isLoading}
          />

          <Input
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            disabled={loading || isLoading}
            helperText={mode === 'signup' ? 'At least 8 characters' : undefined}
          />

          {mode === 'signup' && (
            <>
              <Input
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                disabled={loading || isLoading}
              />

              {/* Custom fields */}
              {renderCustomFields()}

              {/* Terms checkbox */}
              {signUpConfig.showTermsCheckbox && Checkbox && (
                <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked)}
                  required
                  disabled={loading || isLoading}
                />
                <Label htmlFor="terms">
                <>
                      I agree to the{' '}
                      {signUpConfig.termsUrl ? (
                        <a href={signUpConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {signUpConfig.termsText || 'terms and conditions'}
                        </a>
                      ) : (
                        <span>{signUpConfig.termsText || 'terms and conditions'}</span>
                      )}
                    </>
                </Label>
                </div>
              )}
              {/* Fallback if Checkbox is not provided */}
              {signUpConfig.showTermsCheckbox && !Checkbox && (
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    disabled={loading || isLoading}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{' '}
                    {signUpConfig.termsUrl ? (
                      <a href={signUpConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {signUpConfig.termsText || 'terms and conditions'}
                      </a>
                    ) : (
                      <span>{signUpConfig.termsText || 'terms and conditions'}</span>
                    )}
                  </label>
                </div>
              )}
            </>
          )}

          {mode === 'signin' && signInConfig.showRememberMe && Checkbox && (
            <div className="flex items-center gap-3">
              <Checkbox
                id="rememberMe"
                checked={!!formData.rememberMe}
                onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
                disabled={loading || isLoading}
                label="Remember me"
              />
              <Label htmlFor="rememberMe">Remember me</Label>
            </div>
          )}
          {/* Fallback if Checkbox is not provided */}
          {mode === 'signin' && signInConfig.showRememberMe && !Checkbox && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                disabled={loading || isLoading}
              />
              <label className="text-sm">Remember me</label>
            </div>
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
              {mode === 'signin' ? (labels.signIn || 'Sign In') : (labels.signUp || 'Create Account')}
            </Button>
          </div>

          {mode === 'signin' && signInConfig.showForgotPassword && (
            <div className="text-center text-sm">
              <a
                href={signInConfig.forgotPasswordUrl || '/forgot-password'}
                className="text-blue-600 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          )}
        </form>
      )}

      {/* Magic Link */}
      {authMethods.magicLink && (
        <>
          {(authMethods.emailPassword || authMethods.username) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
          
          {magicLinkSent ? (
            <Alert variant="success">
              {labels.magicLinkSent || 'Magic link sent! Check your email.'}
            </Alert>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
                disabled={loading || isLoading}
              />
              <Button
                type="submit"
                loading={loading || isLoading}
                variant="outline"
                className="w-full"
              >
                {labels.sendMagicLink || 'Send Magic Link'}
              </Button>
            </form>
          )}
        </>
      )}

      {/* Phone Authentication */}
      {authMethods.phone && (
        <>
          {(authMethods.emailPassword || authMethods.username || authMethods.magicLink) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
          
          <form onSubmit={handlePhone} className="space-y-4">
            <Input
              type="tel"
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
              disabled={loading || isLoading}
            />
            <Button
              type="submit"
              loading={loading || isLoading}
              variant="outline"
              className="w-full"
            >
              {labels.sendPhoneCode || 'Send Verification Code'}
            </Button>
          </form>
        </>
      )}

      {/* OAuth buttons (if not socialFirst) */}
      {!config.socialFirst && authMethods.oauth && (authMethods.emailPassword || authMethods.username || authMethods.magicLink || authMethods.phone) && Divider && (
        <Divider label={labels.or || 'or'} />
      )}
      {!config.socialFirst && authMethods.oauth && renderOAuthButtons()}

      {/* Passkey (if not socialFirst) */}
      {!config.socialFirst && authMethods.passkey && (
        <>
          {(authMethods.emailPassword || authMethods.username || authMethods.magicLink || authMethods.phone || authMethods.oauth) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
          <Button
            onClick={handlePasskey}
            variant="outline"
            disabled={loading || isLoading}
            className="w-full"
          >
            {labels.signInWithPasskey || 'Sign in with Passkey'}
          </Button>
        </>
      )}
    </div>
  );
}

