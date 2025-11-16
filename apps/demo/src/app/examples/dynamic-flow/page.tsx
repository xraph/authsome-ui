'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Code, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FlowProvider, AuthFlow, useFlow } from '@authsome/ui-react';
import { FlowStep, FlowConfigType, getFlowConfig } from '@authsome/ui-core';
import { useAuth } from '@authsome/ui-react';

// Step renderers
function EmailPasswordSignInStep({ state, onNext, onBack, isLoading }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({ email, password });
      await onNext({
        user: result.user,
        session: result.session,
        email,
        // Simulate MFA requirement
        mfaRequired: email.includes('mfa'),
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sign In</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="john@example.com"
            required
          />
          <p className="text-xs text-muted-foreground">
            Tip: Use email with "mfa" to trigger MFA flow
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}

function MFARequiredStep({ state, onNext }: any) {
  return (
    <div className="space-y-4 text-center py-6">
      <Shield className="h-12 w-12 text-primary mx-auto" />
      <h3 className="text-lg font-semibold">Two-Factor Authentication Required</h3>
      <p className="text-sm text-muted-foreground">
        Your account has MFA enabled. Please verify your identity.
      </p>
      <Button onClick={() => onNext()} className="w-full">
        Continue to MFA
      </Button>
    </div>
  );
}

function MFAVerifyStep({ state, onNext, onBack, isLoading }: any) {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate MFA verification
    if (code === '123456') {
      await onNext();
    } else {
      alert('Invalid code. Try 123456');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Verify Code</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter code from your authenticator app (use 123456 for demo)
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SuccessStep({ user }: any) {
  return (
    <div className="space-y-4 text-center py-6">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-bold">Successfully Authenticated!</h3>
      <p className="text-muted-foreground">
        Welcome back{user?.email ? `, ${user.email}` : ''}!
      </p>
    </div>
  );
}

function LoadingStep() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ErrorStep({ error }: any) {
  return (
    <div className="space-y-4 text-center py-6">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
      <h3 className="text-xl font-bold">Error</h3>
      <p className="text-muted-foreground">{error?.message || 'An error occurred'}</p>
    </div>
  );
}

// Flow Status Display
function FlowStatus() {
  const { state, currentStep, canGoBack, back, reset } = useFlow();
  const history = state.metadata?.history as string[] || [currentStep];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Current Step</h4>
        <div className="px-3 py-2 bg-primary/10 rounded-md">
          <code className="text-sm text-primary">{currentStep}</code>
        </div>
      </div>
      
      {state.email && (
        <div>
          <h4 className="font-medium mb-2">Flow Data</h4>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">
            <p>Email: {state.email}</p>
            {state.mfaRequired && <p>MFA: Required</p>}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="font-medium mb-2">Flow History</h4>
        <div className="space-y-1">
          {history.map((step, index) => (
            <div
              key={index}
              className="px-3 py-1 bg-muted rounded text-xs flex items-center gap-2"
            >
              <span className="text-muted-foreground">{index + 1}.</span>
              <code>{step}</code>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        {canGoBack && (
          <Button onClick={back} variant="outline" className="flex-1" size="sm">
            ← Back
          </Button>
        )}
        <Button onClick={reset} variant="outline" className="flex-1" size="sm">
          Reset Flow
        </Button>
      </div>
    </div>
  );
}

// Main flow demo
function FlowDemo({ flowType }: { flowType: FlowConfigType }) {
  const config = getFlowConfig(flowType);

  return (
    <FlowProvider config={config}>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Flow</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthFlow
              renderers={{
                [FlowStep.EMAIL_PASSWORD_SIGN_IN]: EmailPasswordSignInStep,
                [FlowStep.MFA_REQUIRED]: MFARequiredStep,
                [FlowStep.MFA_VERIFY]: MFAVerifyStep,
              }}
              loadingComponent={LoadingStep}
              successComponent={SuccessStep}
              errorComponent={ErrorStep}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flow State</CardTitle>
            <CardDescription>Real-time flow tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <FlowStatus />
          </CardContent>
        </Card>
      </div>
    </FlowProvider>
  );
}

export default function DynamicFlowPage() {
  const [showCode, setShowCode] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowConfigType>(FlowConfigType.SIGN_IN_WITH_MFA);

  const codeExample = `import { FlowProvider, AuthFlow, FlowConfigType, getFlowConfig } from '@authsome/ui-react';

// Get predefined flow config
const config = getFlowConfig(FlowConfigType.SIGN_IN_WITH_MFA);

function MyAuthPage() {
  return (
    <FlowProvider config={config}>
      <AuthFlow
        renderers={{
          [FlowStep.EMAIL_PASSWORD_SIGN_IN]: SignInForm,
          [FlowStep.MFA_VERIFY]: MFAVerifyForm,
        }}
        successComponent={SuccessScreen}
      />
    </FlowProvider>
  );
}`;

  return (
    <AuthProviderWrapper>
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
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Dynamic Auth Flows</h1>
              </div>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Code className="h-4 w-4" />
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">Dynamic Authentication Flows</h2>
              <p className="text-muted-foreground mb-6">
                Configure complex multi-step authentication journeys with conditional logic,
                MFA, verification, and dynamic routing.
              </p>

              {/* Flow selector */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setSelectedFlow(FlowConfigType.SIGN_IN_WITH_MFA)}
                  variant={selectedFlow === FlowConfigType.SIGN_IN_WITH_MFA ? 'default' : 'outline'}
                  size="sm"
                >
                  Sign In with MFA
                </Button>
                <Button
                  onClick={() => setSelectedFlow(FlowConfigType.SIMPLE_SIGN_IN)}
                  variant={selectedFlow === FlowConfigType.SIMPLE_SIGN_IN ? 'default' : 'outline'}
                  size="sm"
                >
                  Simple Sign In
                </Button>
              </div>
            </div>

            {showCode && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Code Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{codeExample}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Flow Demo */}
            <FlowDemo key={selectedFlow} flowType={selectedFlow} />

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">State Machine</h4>
                    <p className="text-sm text-muted-foreground">
                      Robust flow engine with state transitions and history
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Conditional Logic</h4>
                    <p className="text-sm text-muted-foreground">
                      Dynamic routing based on user state (e.g., MFA if enabled)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Custom Renderers</h4>
                    <p className="text-sm text-muted-foreground">
                      Bring your own UI components for each step
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Predefined Flows</h4>
                    <p className="text-sm text-muted-foreground">
                      7+ ready-to-use flow configurations
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Simple Sign In/Up</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Sign In with MFA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Sign Up with Email Verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Magic Link Flow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Phone Auth Flow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>OAuth Flow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Password Reset Flow</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthProviderWrapper>
  );
}

