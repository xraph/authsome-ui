/**
 * Unified authentication renderer
 * 
 * Shows all enabled auth methods (email, OAuth, magic link, etc.) in one view
 * with Microsoft/Google-style dynamic flow for sign-in
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import type { FlowState, OAuthProvider, FieldDefinition } from '@authsome/ui-core';
import { defaultLocale, interpolate } from '@authsome/ui-core';

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
  onBack: _onBack,
  isLoading,
  uiComponents,
  rendererConfig,
  mode,
}: UnifiedAuthRendererProps) {
  const auth = useAuth();
  const { signIn, signUp, oauthSignIn, sendMagicLink, sendPhoneCode, authenticatePasskey, adapter } = auth;
  const { Input, Button, Alert: AlertComponents, Divider, Checkbox, Select, Textarea, Field, icons } = uiComponents;
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};

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
  const [authStep, setAuthStep] = useState<'email' | 'method'>('email');
  const [dynamicFields, setDynamicFields] = useState<FieldDefinition[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  const config = rendererConfig || {};
  const authMethods = config.authMethods || {};
  const signUpConfig = config.signUp || {};
  const signInConfig = config.signIn || {};
  const labels = config.labels || {};
  const locale = config.locale || defaultLocale;

  // Detect if we should use dynamic flow
  const hasMultipleEmailMethods = 
    (authMethods.emailPassword !== false) && 
    (authMethods.magicLink === true);
  
  const useDynamicFlow = 
    mode === 'signin' && 
    signInConfig.enableDynamicFlow !== false &&
    hasMultipleEmailMethods;

  // Fetch dynamic fields on mount for signup
  useEffect(() => {
    const fetchFields = async () => {
      if (mode === 'signup' && signUpConfig.useDynamicFields !== false && adapter?.getSignupFields) {
        try {
          const fields = await adapter.getSignupFields();
          setDynamicFields(fields);
          
          // Initialize dynamic values with default values
          const initialValues: Record<string, any> = {};
          fields.forEach(field => {
            if (field.defaultValue !== undefined) {
              initialValues[field.name] = field.defaultValue;
            }
          });
          setDynamicValues(initialValues);
        } catch (err) {
          console.error('Failed to fetch signup fields:', err);
        }
      }
    };
    fetchFields();
  }, [mode, adapter, signUpConfig.useDynamicFields]);

  // Validate dynamic fields
  const validateDynamicFields = (): string | null => {
    if (mode !== 'signup') return null;

    for (const field of dynamicFields) {
      const value = dynamicValues[field.name];
      const validation = field.validation;

      if (!validation) continue;

      // Required validation
      if (validation.required && (value === undefined || value === '' || value === null)) {
        return validation.errorMessage || `${field.label} is required`;
      }

      // Skip other validations if value is empty and not required
      if (value === undefined || value === '' || value === null) continue;

      // String length validations
      if (typeof value === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
          return validation.errorMessage || `${field.label} must be at least ${validation.minLength} characters`;
        }
        if (validation.maxLength && value.length > validation.maxLength) {
          return validation.errorMessage || `${field.label} must be at most ${validation.maxLength} characters`;
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          return validation.errorMessage || `${field.label} must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && value > validation.max) {
          return validation.errorMessage || `${field.label} must be at most ${validation.max}`;
        }
      }

      // Pattern validation
      if (validation.pattern && typeof value === 'string') {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return validation.errorMessage || `${field.label} format is invalid`;
          }
        } catch (e) {
          console.error('Invalid regex pattern:', validation.pattern);
        }
      }
    }
    return null;
  };

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

  // Handle email continue (dynamic flow step 1)
  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError(locale.validation?.emailRequired || 'Email is required');
      return;
    }
    setError(null);
    setAuthStep('method');
  };

  // Handle email/password submit
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError(locale.validation?.passwordMismatch || 'Passwords do not match');
      return;
    }

    if (mode === 'signup' && signUpConfig.showTermsCheckbox && !agreedToTerms) {
      setError(locale.validation?.termsRequired || 'You must agree to the terms and conditions');
      return;
    }

    // Validate custom fields
    const customFieldError = validateCustomFields();
    if (customFieldError) {
      setError(customFieldError);
      return;
    }

    // Validate dynamic fields
    const dynamicFieldError = validateDynamicFields();
    if (dynamicFieldError) {
      setError(dynamicFieldError);
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

    if (!signIn || !signUp) {
      setError('Authentication is not available');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn({ email: formData.email, password: formData.password });
      } else {
        await signUp({ 
          email: formData.email, 
          password: formData.password,
          ...formData, // Include custom fields
          ...dynamicValues, // Include dynamic field values
        });
      }

      // Auth state is updated internally, just move to next step
      await onNext({ email: formData.email });
    } catch (err: any) {
      setError(err.message || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth
  const handleOAuth = async (provider: OAuthProvider) => {
    if (!oauthSignIn) {
      setError('OAuth sign-in is not available');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const url = await oauthSignIn({
        provider,
        redirectUri: window.location.origin + '/auth/callback',
      });
      
      if (url) {
        window.location.href = url;
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
      setError(locale.validation?.emailRequired || 'Email is required');
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
    if (!authenticatePasskey) {
      setError('Passkey authentication is not available');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authenticatePasskey({});
      // Auth state is updated internally, just move to next step
      await onNext({});
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
        await sendPhoneCode({ phone: formData.phone });
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

    // Get provider name - check locale first, then hardcoded names, then capitalize
    const getProviderName = (provider: string): string => {
      // Try locale first (with fallback to defaultLocale)
      const localeName = locale.oauth?.[provider as keyof typeof locale.oauth] || 
                         defaultLocale.oauth[provider as keyof typeof defaultLocale.oauth];
      if (localeName && typeof localeName === 'string') {
        return localeName;
      }
      
      // Fallback to capitalize provider string
      return provider.charAt(0).toUpperCase() + provider.slice(1);
    };

    // Get provider icons from the correct property
    const providerIcons = uiComponents.providerIcons;
    
    // Check layout preference (default or horizontal)
    const layout = typeof authMethods.oauth === 'object' && authMethods.oauth.layout
      ? authMethods.oauth.layout
      : 'default';

    // Horizontal layout - icons only
    if (layout === 'horizontal') {
      return (
        <div className="flex items-center justify-center gap-3">
          {providers.map((provider) => {
            const ProviderIcon = providerIcons?.[provider];
            const label = getProviderName(provider);
            
            return (
              <Button
                key={provider}
                type="button"
                onClick={() => handleOAuth(provider)}
                variant="outline"
                size="icon"
                disabled={loading || isLoading}
                title={interpolate(labels.continueWith || locale.auth?.continueWith || 'Continue with {provider}', { provider: label })}
                className="size-10"
              >
                {ProviderIcon && <ProviderIcon className="size-5" />}
              </Button>
            );
          })}
        </div>
      );
    }

    // Default layout - full width buttons with icons and text
    return (
      <div className="space-y-2">
        {providers.map((provider) => {
          const ProviderIcon = providerIcons?.[provider];
          const label = getProviderName(provider);

          return (
            <Button
              key={provider}
              type="button"
              onClick={() => handleOAuth(provider)}
              variant="outline"
              disabled={loading || isLoading}
              className="w-full"
            >
              {ProviderIcon && <ProviderIcon className="size-5" />}
              <span>{interpolate(labels.continueWith || locale.auth?.continueWith || 'Continue with {provider}', { provider: label })}</span>
            </Button>
          );
        })}
      </div>
    );
  };

  // Render custom fields
  const renderCustomFields = () => {
    if (mode !== 'signup' || !signUpConfig.customFields) return null;

    return signUpConfig.customFields.map((field) => {
      const value = formData[field.name] || field.defaultValue || '';

      if (field.type === 'select' && Select) {
        // Use composite Select (shadcn-style)
        const { Root, Trigger, Value, Content, Item } = Select;
        
        return (
          <Field.Field key={field.name}>
            <Field.FieldLabel htmlFor={field.name}>{field.label}</Field.FieldLabel>
            <Root
              value={value}
              onValueChange={(newValue: string) => setFormData({ ...formData, [field.name]: newValue })}
              disabled={loading || isLoading}
            >
              <Trigger className="w-full" id={field.name}>
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
            {field.helperText && <Field.FieldDescription>{field.helperText}</Field.FieldDescription>}
          </Field.Field>
        );
      }

      if (field.type === 'checkbox') {
        return (
          <Field.Field key={field.name} orientation="horizontal">
            {Checkbox && (
              <Checkbox
                checked={!!value}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, [field.name]: checked })}
                required={field.required}
                disabled={loading || isLoading}
              />
            )}
            <Field.FieldLabel htmlFor={field.name}>{field.label}</Field.FieldLabel>
          </Field.Field>
        );
      }

      if (field.type === 'textarea') {
        return (
          <Field.Field key={field.name}>
            <Field.FieldLabel htmlFor={field.name}>{field.label}</Field.FieldLabel>
            {Textarea ? (
              <Textarea
                id={field.name}
                value={value}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading || isLoading}
                rows={4}
              />
            ) : (
              <textarea
                id={field.name}
                value={value}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading || isLoading}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            )}
            {field.helperText && <Field.FieldDescription>{field.helperText}</Field.FieldDescription>}
          </Field.Field>
        );
      }

      return (
        <Field.Field key={field.name}>
          <Field.FieldLabel htmlFor={field.name}>{field.label}</Field.FieldLabel>
        <Input
            id={field.name}
          type={field.type || 'text'}
          value={value}
          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
          placeholder={field.placeholder}
          required={field.required}
          disabled={loading || isLoading}
          minLength={field.minLength}
          maxLength={field.maxLength}
          min={field.min}
          max={field.max}
            aria-invalid={!!error}
        />
          {field.helperText && <Field.FieldDescription>{field.helperText}</Field.FieldDescription>}
        </Field.Field>
      );
    });
  };

  // Render dynamic fields from backend
  const renderDynamicFields = () => {
    if (mode !== 'signup' || dynamicFields.length === 0) return null;

    return dynamicFields.map((field) => {
      const value = dynamicValues[field.name];
      const handleChange = (newValue: any) => {
        setDynamicValues(prev => ({ ...prev, [field.name]: newValue }));
      };

      const fieldId = `dynamic-${field.name}`;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
        case 'password':
        case 'number':
        case 'date':
          return (
            <Field.Field key={field.name}>
              <Field.FieldLabel htmlFor={fieldId}>
                {field.label}
                {field.validation?.required && ' *'}
              </Field.FieldLabel>
              <Input
                id={fieldId}
                type={field.type}
                value={value || ''}
                onChange={(e) => handleChange(field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                placeholder={field.placeholder}
                required={field.validation?.required}
                disabled={loading || isLoading}
                minLength={field.validation?.minLength}
                maxLength={field.validation?.maxLength}
                min={field.validation?.min}
                max={field.validation?.max}
              />
              {field.helperText && (
                <Field.FieldDescription>{field.helperText}</Field.FieldDescription>
              )}
            </Field.Field>
          );

        case 'textarea':
          if (!Textarea) return null;
          return (
            <Field.Field key={field.name}>
              <Field.FieldLabel htmlFor={fieldId}>
                {field.label}
                {field.validation?.required && ' *'}
              </Field.FieldLabel>
              <Textarea
                id={fieldId}
                value={value || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={field.placeholder}
                required={field.validation?.required}
                disabled={loading || isLoading}
              />
              {field.helperText && (
                <Field.FieldDescription>{field.helperText}</Field.FieldDescription>
              )}
            </Field.Field>
          );

        case 'select':
          if (!Select || !field.options) return null;
          return (
            <Field.Field key={field.name}>
              <Field.FieldLabel htmlFor={fieldId}>
                {field.label}
                {field.validation?.required && ' *'}
              </Field.FieldLabel>
              <Select.Root
                value={value || ''}
                onValueChange={handleChange}
                disabled={loading || isLoading}
              >
                <Select.Trigger id={fieldId}>
                  <Select.Value placeholder={field.placeholder || 'Select...'} />
                </Select.Trigger>
                <Select.Content>
                  {field.options.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {field.helperText && (
                <Field.FieldDescription>{field.helperText}</Field.FieldDescription>
              )}
            </Field.Field>
          );

        case 'checkbox':
          if (!Checkbox) return null;
          return (
            <Field.Field key={field.name}>
              <Checkbox
                id={fieldId}
                checked={!!value}
                onCheckedChange={handleChange}
                disabled={loading || isLoading}
                label={field.label}
                description={field.helperText}
              />
            </Field.Field>
          );

        default:
          return null;
      }
    });
  };

  // Dynamic flow: Email step (sign-in only)
  if (useDynamicFlow && authStep === 'email') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {labels.signIn || 'Sign in'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {locale.signIn?.enterEmail || 'Enter your email to continue'}
          </p>
        </div>

        {error && Alert && AlertDescription && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OAuth buttons at top (if socialFirst) */}
        {config.socialFirst && authMethods.oauth && (
          <>
            {renderOAuthButtons()}
            {/* Divider after OAuth */}
            {Divider && <Divider label={labels.or || 'or'} />}
          </>
        )}

        {/* Email input */}
        <form onSubmit={handleEmailContinue} className="space-y-4">
          <Field.Field>
            <Field.FieldLabel htmlFor="email">{locale.auth?.email || 'Email'}</Field.FieldLabel>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
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
            {signInConfig.continueButtonText || locale.common?.continue || 'Continue'}
          </Button>
        </form>

        {/* OAuth buttons at bottom (if not socialFirst) */}
        {!config.socialFirst && authMethods.oauth && (
          <>
            {Divider && <Divider label={labels.or || 'or'} />}
            {renderOAuthButtons()}
          </>
        )}

        {/* Passkey always at bottom (regardless of socialFirst) */}
        {authMethods.passkey && (
          <>
            {config.socialFirst && Divider && <Divider label={labels.or || 'or'} />}
            <Button
              type="button"
              onClick={handlePasskey}
              variant="outline"
              disabled={loading || isLoading}
              className="w-full"
            >
              {icons?.passkey && <icons.passkey className="size-5" />}
              {!icons?.passkey && <span className="text-lg">🔑</span>}
              <span>{labels.signInWithPasskey || 'Sign in with Passkey'}</span>
            </Button>
          </>
        )}
      </div>
    );
  }

  // Dynamic flow: Method step (sign-in only)
  if (useDynamicFlow && authStep === 'method') {
    return (
      <div className="space-y-6">
        {/* Back link */}
        <button
          onClick={() => setAuthStep('email')}
          className="text-sm text-primary hover:underline flex items-center gap-1"
          type="button"
        >
          ← Back
        </button>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {labels.signIn || 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {formData.email}
          </p>
        </div>

        {error && Alert && AlertDescription && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Password form (if enabled) */}
        {authMethods.emailPassword !== false && (
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            <Field.Field>
              <div className="flex items-center justify-between">
                <Field.FieldLabel htmlFor="password">{locale.auth?.password || 'Password'}</Field.FieldLabel>
                {signInConfig.showForgotPassword && (
                  <a 
                    href={signInConfig.forgotPasswordUrl || '/forgot-password'} 
                    className="text-sm text-primary hover:underline"
                  >
                    {locale.auth?.forgotPassword || 'Forgot password?'}
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                disabled={loading || isLoading}
                aria-invalid={!!error}
              />
            </Field.Field>

            {signInConfig.showRememberMe && Checkbox && (
              <Field.Field orientation="horizontal">
                <Checkbox
                  checked={!!formData.rememberMe}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, rememberMe: checked })}
                  disabled={loading || isLoading}
                />
                <Field.FieldLabel htmlFor="rememberMe">Remember me</Field.FieldLabel>
              </Field.Field>
            )}

            <Button
              type="submit"
              loading={loading || isLoading}
              className="w-full"
            >
              {labels.signIn || locale.auth?.signIn || 'Sign In'}
            </Button>
          </form>
        )}

        {/* Magic Link option */}
        {authMethods.magicLink && (
          <>
            {authMethods.emailPassword !== false && Divider && (
              <Divider label={labels.or || locale.common?.or || 'or'} />
            )}
            
            {magicLinkSent ? (
              Alert && AlertDescription && (
                <Alert variant="success">
                  <AlertDescription>
                    {labels.magicLinkSent || 'Magic link sent! Check your email.'}
                  </AlertDescription>
                </Alert>
              )
            ) : (
              <Button
                type="button"
                onClick={handleMagicLink}
                loading={loading || isLoading}
                variant="outline"
                className="w-full"
              >
                {icons?.magicLink && <icons.magicLink className="size-5" />}
                <span>{labels.sendMagicLink || 'Send Magic Link'}</span>
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  // Standard flow (non-dynamic or sign-up)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === 'signin' ? (labels.signIn || 'Welcome back') : (labels.signUp || 'Create your account')}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'signin'
            ? locale.signIn?.subtitle || 'Enter your credentials to sign in'
            : locale.signUp?.subtitle || 'Enter your details to create a new account'}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* OAuth buttons at top (if socialFirst) */}
      {config.socialFirst && authMethods.oauth && (
        <>
          {renderOAuthButtons()}
          {/* Divider after OAuth when other methods exist */}
          {(authMethods.emailPassword || authMethods.magicLink || authMethods.phone || authMethods.username || authMethods.passkey) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
        </>
      )}

      {/* Username/Password form */}
      {authMethods.username && (
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <Field.Field>
            <Field.FieldLabel htmlFor="username">{locale.auth?.username || 'Username'}</Field.FieldLabel>
          <Input
              id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="johndoe"
            required
            disabled={loading || isLoading}
              aria-invalid={!!error}
          />
          </Field.Field>

          <Field.Field>
            <Field.FieldLabel htmlFor="password">Password</Field.FieldLabel>
          <Input
              id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
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
            {mode === 'signin' ? (labels.signIn || locale.auth?.signIn || 'Sign In') : (labels.signUp || locale.signUp?.title || 'Create Account')}
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
          <Field.Field>
            <Field.FieldLabel htmlFor="email">{locale.auth?.email || 'Email'}</Field.FieldLabel>
          <Input
              id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
            disabled={loading || isLoading}
              aria-invalid={!!error}
          />
          </Field.Field>

          <Field.Field>
            <div className="flex items-center justify-between">
              <Field.FieldLabel htmlFor="password">Password</Field.FieldLabel>
              {mode === 'signin' && signInConfig.showForgotPassword && (
                <a 
                  href={signInConfig.forgotPasswordUrl || '/forgot-password'} 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </a>
              )}
            </div>
          <Input
              id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            disabled={loading || isLoading}
              aria-invalid={!!error}
          />
            {mode === 'signup' && (
              <Field.FieldDescription>At least 8 characters</Field.FieldDescription>
            )}
          </Field.Field>

          {mode === 'signup' && (
            <>
              <Field.Field>
                <Field.FieldLabel htmlFor="confirmPassword">{locale.auth?.confirmPassword || 'Confirm Password'}</Field.FieldLabel>
              <Input
                  id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                disabled={loading || isLoading}
                  aria-invalid={!!error}
              />
              </Field.Field>

              {/* Custom fields */}
              {renderCustomFields()}

              {/* Dynamic fields from backend */}
              {renderDynamicFields()}

              {/* Terms checkbox */}
              {signUpConfig.showTermsCheckbox && Checkbox && (
                <Field.Field orientation="horizontal">
                <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={(checked: boolean) => setAgreedToTerms(!!checked)}
                    required
                    disabled={loading || isLoading}
                  />
                  <Field.FieldLabel htmlFor="terms" className="font-normal">
                    I agree to the{' '}
                    {signUpConfig.termsUrl ? (
                      <a href={signUpConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {signUpConfig.termsText || 'terms and conditions'}
                      </a>
                    ) : (
                      <span>{signUpConfig.termsText || 'terms and conditions'}</span>
                    )}
                  </Field.FieldLabel>
                </Field.Field>
              )}
            </>
          )}

          {mode === 'signin' && signInConfig.showRememberMe && Checkbox && (
            <Field.Field orientation="horizontal">
              <Checkbox
                checked={!!formData.rememberMe}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, rememberMe: checked })}
                disabled={loading || isLoading}
              />
              <Field.FieldLabel htmlFor="rememberMe">Remember me</Field.FieldLabel>
            </Field.Field>
            )}

            <Button
              type="submit"
              loading={loading || isLoading}
            className="w-full"
            >
              {mode === 'signin' ? (labels.signIn || locale.auth?.signIn || 'Sign In') : (labels.signUp || locale.signUp?.title || 'Create Account')}
            </Button>
        </form>
      )}

      {/* Magic Link */}
      {authMethods.magicLink && (
        <>
          {(authMethods.emailPassword || authMethods.username) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
          
          {magicLinkSent ? (
            Alert && AlertDescription && (
              <Alert variant="success">
                <AlertDescription>
                  {labels.magicLinkSent || 'Magic link sent! Check your email.'}
                </AlertDescription>
              </Alert>
            )
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <Field.Field>
                <Field.FieldLabel htmlFor="magicLinkEmail">Email</Field.FieldLabel>
              <Input
                  id="magicLinkEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
                disabled={loading || isLoading}
                  aria-invalid={!!error}
              />
              </Field.Field>
              <Button
                type="submit"
                loading={loading || isLoading}
                variant="outline"
                className="w-full"
              >
                {icons?.magicLink && <icons.magicLink className="size-5" />}
                <span>{labels.sendMagicLink || 'Send Magic Link'}</span>
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
            <Field.Field>
              <Field.FieldLabel htmlFor="phone">Phone Number</Field.FieldLabel>
            <Input
                id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
              disabled={loading || isLoading}
                aria-invalid={!!error}
            />
            </Field.Field>
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

      {/* OAuth buttons at bottom (if not socialFirst) */}
      {!config.socialFirst && authMethods.oauth && (
        <>
          {(authMethods.emailPassword || authMethods.username || authMethods.magicLink || authMethods.phone) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
          {renderOAuthButtons()}
        </>
      )}

      {/* Passkey always at bottom (regardless of socialFirst) */}
      {authMethods.passkey && (
        <>
          {(authMethods.emailPassword || authMethods.username || authMethods.magicLink || authMethods.phone || authMethods.oauth) && Divider && (
            <Divider label={labels.or || 'or'} />
          )}
          <Button
            type="button"
            onClick={handlePasskey}
            variant="outline"
            disabled={loading || isLoading}
            className="w-full"
          >
            {icons?.passkey && <icons.passkey className="size-5" />}
            {!icons?.passkey && <span className="text-lg">🔑</span>}
            <span>{labels.signInWithPasskey || 'Sign in with Passkey'}</span>
          </Button>
        </>
      )}
    </div>
  );
}
