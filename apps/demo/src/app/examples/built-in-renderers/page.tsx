'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthProvider, AuthFlow, type UIComponents, type RendererConfig, useAuth } from '@authsome/ui-react';
import { AuthClient, getFlowConfig, FlowConfigType } from '@authsome/ui-core';
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { createAuthClient, ProviderType } from '@/lib/auth-client';
import { Shield } from 'lucide-react';
import { SiGoogle, SiGithub } from 'react-icons/si';
import { FaMicrosoft } from 'react-icons/fa';


// Map shadcn components to AuthSome UI interface
const uiComponents: UIComponents = {
  // Input component
  Input: Input,
  
  // Button component
  Button: Button,

  // Field components
  Field: {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
  },

  // Checkbox component (for "Remember me" and terms)
  Checkbox: Checkbox,
  
  // Select component (composite shadcn/Radix pattern)
  Select: {
    Root: Select,
    Trigger: SelectTrigger,
    Value: SelectValue,
    Content: SelectContent,
    Item: SelectItem,
  },
  
  // Alert component (composite pattern)
  Alert: {
    Alert,
    AlertTitle,
    AlertDescription,
  },
  
  // Card component (composite pattern)
  Card: {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  },
  
  
  // Divider component
  Divider: ({ label }) => (
    <div className="relative flex items-center gap-2">
      <Separator className="flex-1" />
      {label && <span className="text-xs">{label}</span>}
      <Separator className="flex-1" />
    </div>
  ),
  
  // Link component
  Link: ({ href, children, onClick, className }) => (
    <a
      href={href}
      onClick={onClick}
      className={`text-primary underline-offset-4 hover:underline ${className || ''}`}
    >
      {children}
    </a>
  ),

  // OAuth provider icons
  providerIcons: {
    google: SiGoogle,
    github: SiGithub,
    microsoft: FaMicrosoft,
  },
};

// Debug: Log to verify icons are imported
console.log('Demo page - Provider icons:', {
  google: SiGoogle,
  github: SiGithub,
  microsoft: FaMicrosoft,
  googleType: typeof SiGoogle,
});

// Wrapper component that provides auth client and passes through flow config
function FlowDemoWrapper({ children }: { children: React.ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [demoMode, setDemoMode] = useState<'basic' | 'advanced' | 'horizontal'>('basic');

  useEffect(() => {
    createAuthClient('authsome').then(setAuthClient);
  }, []);

  if (!authClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Basic configuration - email/password only, no extras
  const basicConfig: RendererConfig = {
    authMethods: {
      emailPassword: true,
    },
    signIn: {
      showRememberMe: false,
    },
  };

  // Advanced configuration with multiple auth methods and custom fields
  const advancedConfig: RendererConfig = {
    authMethods: {
      emailPassword: true,
      oauth: {
        providers: ['google', 'github', 'microsoft'],
        layout: demoMode === 'horizontal' ? 'horizontal' : 'default', // Support both layouts
      },
      magicLink: true,
      passkey: true,
      username: true,
    },
    signIn: {
      showRememberMe: true,
    },
    signUp: {
      customFields: [
        {
          name: 'fullName',
          label: 'Full Name',
          type: 'text',
          required: true,
          minLength: 2,
          placeholder: 'John Doe',
        },
        {
          name: 'role',
          label: 'Your Role',
          type: 'select',
          required: true,
          options: [
            { value: 'developer', label: 'Developer' },
            { value: 'designer', label: 'Designer' },
            { value: 'manager', label: 'Product Manager' },
            { value: 'other', label: 'Other' },
          ],
        },
      ],
      showTermsCheckbox: true,
      termsText: 'terms and conditions',
      termsUrl: '/terms',
    },
    socialFirst: false,
    labels: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      or: 'Or continue with',
      continueWith: 'Continue with {provider}',
    },
  };

  const currentFlowConfig = getFlowConfig(
    demoMode === 'basic' ? FlowConfigType.SIMPLE_SIGN_IN : FlowConfigType.COMPLETE_SIGN_UP_FLOW
  );
  
  const finalRendererConfig = demoMode === 'basic' ? basicConfig : advancedConfig;

  return (
    <AuthProvider
      client={authClient}
      flows={currentFlowConfig}
      uiComponents={uiComponents}
      rendererConfig={finalRendererConfig}
    >
      {typeof children === 'function' ? children({ demoMode, setDemoMode }) : children}
    </AuthProvider>
  );
}

// Main page component
export default function BuiltInRenderersPage() {
  return (
    <FlowDemoWrapper>
      {({ demoMode, setDemoMode }: { demoMode: 'basic' | 'advanced' | 'horizontal'; setDemoMode: (mode: 'basic' | 'advanced' | 'horizontal') => void }) => (
        <BuiltInRenderersContentNew demoMode={demoMode} setDemoMode={setDemoMode} />
      )}
    </FlowDemoWrapper>
  );
}

// Updated content component that receives demoMode as props
function BuiltInRenderersContentNew({ 
  demoMode, 
  setDemoMode 
}: { 
  demoMode: 'basic' | 'advanced' | 'horizontal'; 
  setDemoMode: (mode: 'basic' | 'advanced' | 'horizontal') => void 
}) {
  const { client } = useAuth();

  return (
    <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/examples"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Examples
              </Link>
              <h1 className="text-xl font-bold">Built-in Renderers (v2 - Merged Provider)</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Complete Auth UI with Zero Custom Code</h2>
              <p className="text-muted-foreground max-w-2xl">
                Configure auth methods, custom fields, OAuth providers, and more - all through simple configuration!
                Now with unified AuthProvider (FlowProvider merged in v2).
              </p>
              
              {/* Adapter Status Indicator */}
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Adapter Connected: {client?.provider?.name || 'authsome'}
                </span>
                <span className="text-muted-foreground">
                  (AuthProvider with flows → AuthClient → {client?.provider?.name || 'AuthSome'}Adapter)
                </span>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="mb-8 flex gap-2">
              <Button
                onClick={() => setDemoMode('basic')}
                variant={demoMode === 'basic' ? 'default' : 'outline'}
              >
                Basic Example
              </Button>
              <Button
                onClick={() => setDemoMode('advanced')}
                variant={demoMode === 'advanced' ? 'default' : 'outline'}
              >
                Advanced (Vertical)
              </Button>
              <Button
                onClick={() => setDemoMode('horizontal')}
                variant={demoMode === 'horizontal' ? 'default' : 'outline'}
              >
                Horizontal Icons
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Live Demo */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Live Demo</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>{demoMode === 'basic' ? 'Sign In' : 'Complete Sign Up'}</CardTitle>
                    <CardDescription>
                      {demoMode === 'basic' 
                        ? 'Email & password only' 
                        : 'With OAuth, magic link & custom fields'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* AuthFlow now gets flows from AuthProvider context (v2) */}
                    <AuthFlow />
                  </CardContent>
                </Card>
              </div>

              {/* Code Example */}
              <div>
                <h3 className="text-xl font-semibold mb-4">The Code (v2)</h3>
                <Card>
                  <CardContent className="pt-6">
                    <pre className="text-xs overflow-auto p-4 bg-muted rounded-lg max-h-96">
{demoMode === 'basic' ? `// Basic Example (v2 - FlowProvider merged)
import { AuthProvider, AuthFlow } from '@authsome/ui-react';
import { getFlowConfig, FlowConfigType } from '@authsome/ui-core';

<AuthProvider
  client={authClient}
  flows={getFlowConfig(FlowConfigType.SIMPLE_SIGN_IN)}
  uiComponents={{ Input, Button }}
>
  <AuthFlow />
</AuthProvider>` : `// Advanced Example (v2)
const config: RendererConfig = {
  authMethods: {
    emailPassword: true,
    oauth: {
      providers: ['google', 'github', 'microsoft'],
    },
    magicLink: true,
  },
  signUp: {
    customFields: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
      },
      {
        name: 'role',
        label: 'Your Role',
        type: 'select',
        required: true,
        options: [
          { value: 'developer', label: 'Developer' },
          { value: 'designer', label: 'Designer' },
        ],
      },
    ],
    showTermsCheckbox: true,
  },
};

<AuthProvider
  client={authClient}
  flows={getFlowConfig(FlowConfigType.COMPLETE_SIGN_UP_FLOW)}
  uiComponents={{ Input, Button, Alert }}
  rendererConfig={config}
>
  <AuthFlow />
</AuthProvider>`}
                    </pre>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        ✨ What's New in v2:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li>• FlowProvider merged into AuthProvider</li>
                        <li>• Pass flows, uiComponents, rendererConfig directly to AuthProvider</li>
                        <li>• Simpler API - one provider instead of two</li>
                      </ul>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>{demoMode === 'basic' ? 'Basic mode includes:' : 'Advanced mode adds:'}</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {demoMode === 'basic' ? (
                          <>
                            <li>Email & password authentication</li>
                            <li>Form validation</li>
                            <li>Error handling</li>
                            <li>Loading states</li>
                          </>
                        ) : (
                          <>
                            <li>OAuth providers (Google, GitHub, Microsoft)</li>
                            <li>Magic link authentication</li>
                            <li>Custom signup fields</li>
                            <li>Terms & conditions checkbox</li>
                            <li>Custom validation</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎨 Your Components</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    Works with any UI library: shadcn, Radix, Chakra, MUI, or your own custom components.
                    Just map them to our simple interface.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Zero Boilerplate</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    No forms to build, no validation logic, no error handling. The built-in renderers handle
                    everything automatically.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Fully Customizable</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    Override any step with your custom renderer while built-in renderers handle the rest.
                    Mix and match as needed.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* All Available Renderers */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">All Built-in Renderers</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Email/Password Sign In', icon: '📧' },
                  { name: 'Email/Password Sign Up', icon: '✍️' },
                  { name: 'OAuth Selection', icon: '🔐' },
                  { name: 'OAuth Callback', icon: '🔄' },
                  { name: 'Magic Link Request', icon: '✨' },
                  { name: 'Magic Link Sent', icon: '📬' },
                  { name: 'Phone Auth Request', icon: '📱' },
                  { name: 'Phone Verification', icon: '🔢' },
                  { name: 'Passkey Authentication', icon: '🔑' },
                  { name: 'MFA Required', icon: '🛡️' },
                  { name: 'MFA Method Selection', icon: '🎯' },
                  { name: 'MFA Verification', icon: '✅' },
                  { name: 'Success Screen', icon: '🎉' },
                  { name: 'Error Handling', icon: '⚠️' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Interface */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Component Interface</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Required Components:</h4>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li><code>Input</code> - Text input with label, error, and helper text</li>
                        <li><code>Button</code> - Button with variants and loading state</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Optional Components (Recommended):</h4>
                      <ul className="list-disc list-inside text-muted-foreground">
                        <li><code>Card</code> - Container for content</li>
                        <li><code>Alert</code> - Error/success/info messages</li>
                        <li><code>Divider</code> - Visual separator with optional label</li>
                        <li><code>Link</code> - Navigation links</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <p className="text-sm">
                        <strong>💡 Pro Tip:</strong> The system warns you in development if required components are missing
                        and falls back to defaults, ensuring your app never breaks!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}

