'use client';

import { AuthProviderWrapper } from '@/components/AuthProviderWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ArrowLeft, Mail, Smartphone, Key, User, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FlowProvider, AuthFlow, useFlow } from '@authsome/ui-react';
import { FlowStep, FlowConfigType, FlowConfig } from '@authsome/ui-core';
import { useAuth } from '@authsome/ui-react';

// Comprehensive flow config with all auth methods
const completeAuthFlow: FlowConfig = {
  name: 'Complete Authentication Flow',
  description: 'All-in-one auth with email, OAuth, magic link, phone, MFA, and more',
  initialStep: FlowStep.SIGN_IN,
  allowedSteps: [
    // Entry points
    FlowStep.SIGN_IN,
    FlowStep.SIGN_UP,
    
    // Email/Password
    FlowStep.EMAIL_PASSWORD_SIGN_IN,
    FlowStep.EMAIL_PASSWORD_SIGN_UP,
    
    // OAuth
    FlowStep.OAUTH_SELECT,
    FlowStep.OAUTH_CALLBACK,
    
    // Magic Link
    FlowStep.MAGIC_LINK_REQUEST,
    FlowStep.MAGIC_LINK_SENT,
    
    // Phone
    FlowStep.PHONE_REQUEST,
    FlowStep.PHONE_VERIFY,
    
    // Username
    FlowStep.USERNAME_SIGN_IN,
    
    // Passkey
    FlowStep.PASSKEY_AUTHENTICATE,
    
    // MFA
    FlowStep.MFA_REQUIRED,
    FlowStep.MFA_SELECT_METHOD,
    FlowStep.MFA_VERIFY,
    
    // Verification
    FlowStep.EMAIL_VERIFICATION_REQUIRED,
    
    // Terminal
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.SIGN_IN]: {
      // This is the method selector, doesn't transition automatically
      onSuccess: FlowStep.EMAIL_PASSWORD_SIGN_IN,
    },
    [FlowStep.EMAIL_PASSWORD_SIGN_IN]: {
      onSuccess: FlowStep.SUCCESS,
      conditions: [
        {
          when: (state) => state.mfaRequired === true,
          then: FlowStep.MFA_REQUIRED,
        },
      ],
    },
    [FlowStep.OAUTH_SELECT]: {
      onSuccess: FlowStep.OAUTH_CALLBACK,
    },
    [FlowStep.OAUTH_CALLBACK]: {
      onSuccess: FlowStep.SUCCESS,
      conditions: [
        {
          when: (state) => state.mfaRequired === true,
          then: FlowStep.MFA_REQUIRED,
        },
      ],
    },
    [FlowStep.MAGIC_LINK_REQUEST]: {
      onSuccess: FlowStep.MAGIC_LINK_SENT,
    },
    [FlowStep.PHONE_REQUEST]: {
      onSuccess: FlowStep.PHONE_VERIFY,
    },
    [FlowStep.PHONE_VERIFY]: {
      onSuccess: FlowStep.SUCCESS,
      conditions: [
        {
          when: (state) => state.mfaRequired === true,
          then: FlowStep.MFA_REQUIRED,
        },
      ],
    },
    [FlowStep.USERNAME_SIGN_IN]: {
      onSuccess: FlowStep.SUCCESS,
      conditions: [
        {
          when: (state) => state.mfaRequired === true,
          then: FlowStep.MFA_REQUIRED,
        },
      ],
    },
    [FlowStep.PASSKEY_AUTHENTICATE]: {
      onSuccess: FlowStep.SUCCESS,
    },
    [FlowStep.MFA_REQUIRED]: {
      onSuccess: FlowStep.MFA_VERIFY,
      conditions: [
        {
          when: (state) => (state.mfaMethods?.length || 0) > 1,
          then: FlowStep.MFA_SELECT_METHOD,
        },
      ],
    },
    [FlowStep.MFA_SELECT_METHOD]: {
      onSuccess: FlowStep.MFA_VERIFY,
    },
    [FlowStep.MFA_VERIFY]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.MFA_VERIFY,
    },
  },
};

// Auth Method Selector (Entry Point)
function AuthMethodSelector({ onSelectMethod }: { onSelectMethod: (method: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-2xl font-bold">Welcome Back</h3>
        <p className="text-muted-foreground">Choose your preferred sign-in method</p>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => onSelectMethod('google')}
          variant="outline"
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
        
        <Button
          onClick={() => onSelectMethod('github')}
          variant="outline"
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
          </svg>
          Continue with GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Other Auth Methods */}
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="magic">Magic</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
          <TabsTrigger value="passkey">Passkey</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-2 mt-4">
          <Button onClick={() => onSelectMethod('email')} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Email & Password
          </Button>
        </TabsContent>
        
        <TabsContent value="magic" className="space-y-2 mt-4">
          <Button onClick={() => onSelectMethod('magic-link')} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Send Magic Link
          </Button>
        </TabsContent>
        
        <TabsContent value="phone" className="space-y-2 mt-4">
          <Button onClick={() => onSelectMethod('phone')} className="w-full">
            <Smartphone className="mr-2 h-4 w-4" />
            Phone Number
          </Button>
        </TabsContent>
        
        <TabsContent value="passkey" className="space-y-2 mt-4">
          <Button onClick={() => onSelectMethod('passkey')} className="w-full">
            <Key className="mr-2 h-4 w-4" />
            Use Passkey
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Email/Password Sign In
function EmailPasswordStep({ state, onNext, isLoading }: any) {
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
        // Simulate MFA requirement for demo
        mfaRequired: email.includes('mfa'),
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
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
        <p className="text-xs text-muted-foreground">Use email with "mfa" to trigger MFA</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );
}

// OAuth Callback Handler
function OAuthCallbackStep({ state, onNext }: any) {
  const provider = state.oauthProvider;
  
  return (
    <div className="text-center space-y-4 py-8">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
      <h3 className="text-lg font-semibold">Connecting to {provider}...</h3>
      <p className="text-sm text-muted-foreground">Please wait while we complete the authentication</p>
      <Button onClick={() => onNext({ mfaRequired: true })}>
        Simulate Success (with MFA)
      </Button>
    </div>
  );
}

// Magic Link Request
function MagicLinkStep({ state, onNext, isLoading }: any) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNext({ email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="john@example.com"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Magic Link'}
      </Button>
    </form>
  );
}

// Magic Link Sent
function MagicLinkSentStep({ state }: any) {
  return (
    <div className="text-center space-y-4 py-6">
      <Mail className="h-16 w-16 text-primary mx-auto" />
      <h3 className="text-xl font-bold">Check Your Email</h3>
      <p className="text-muted-foreground">
        We sent a magic link to <strong>{state.email}</strong>
      </p>
      <p className="text-sm text-muted-foreground">
        Click the link in the email to sign in
      </p>
    </div>
  );
}

// Phone Auth
function PhoneAuthStep({ state, onNext, isLoading }: any) {
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onNext({ phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="+1 (555) 000-0000"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Code'}
      </Button>
    </form>
  );
}

// Phone Verify
function PhoneVerifyStep({ state, onNext, onBack, isLoading }: any) {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '123456') {
      await onNext({ mfaRequired: false });
    } else {
      alert('Invalid code. Try 123456');
    }
  };

  return (
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
          Sent to {state.phone} (use 123456 for demo)
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
  );
}

// Passkey Auth
function PasskeyAuthStep({ state, onNext }: any) {
  return (
    <div className="text-center space-y-4 py-6">
      <Key className="h-16 w-16 text-primary mx-auto" />
      <h3 className="text-xl font-bold">Use Your Passkey</h3>
      <p className="text-muted-foreground">
        Use your device's biometric authentication
      </p>
      <Button onClick={() => onNext()} className="w-full">
        Authenticate with Passkey
      </Button>
    </div>
  );
}

// MFA Required
function MFARequiredStep({ state, onNext }: any) {
  return (
    <div className="text-center space-y-4 py-6">
      <Shield className="h-16 w-16 text-primary mx-auto" />
      <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
      <p className="text-muted-foreground">
        Your account is protected with 2FA. Please verify your identity.
      </p>
      <Button onClick={() => onNext()} className="w-full">
        Continue to Verification
      </Button>
    </div>
  );
}

// MFA Verify
function MFAVerifyStep({ state, onNext, onBack, isLoading }: any) {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '123456') {
      await onNext();
    } else {
      alert('Invalid code. Try 123456');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Authentication Code</label>
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
          Enter code from authenticator app (use 123456 for demo)
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
  );
}

// Success Screen with Logout
function SuccessStep({ user }: any) {
  const { signOut } = useAuth();
  const { reset } = useFlow();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      reset(); // Reset flow to start
    } catch (error) {
      alert('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="text-center space-y-6 py-6">
      <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Welcome Back!</h3>
        <p className="text-muted-foreground">
          You're successfully authenticated{user?.email ? ` as ${user.email}` : ''}
        </p>
      </div>
      
      <div className="p-4 bg-muted rounded-lg text-left">
        <h4 className="font-medium mb-2">Session Details</h4>
        <div className="text-sm space-y-1">
          <p>Email: {user?.email || 'N/A'}</p>
          <p>MFA: {user?.mfaEnabled ? 'Enabled ✓' : 'Disabled'}</p>
          <p>Verified: {user?.emailVerified ? 'Yes ✓' : 'No'}</p>
        </div>
      </div>

      <Button
        onClick={handleLogout}
        variant="destructive"
        className="w-full"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Sign Out
      </Button>
    </div>
  );
}

// Loading Component
function LoadingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Processing...</p>
    </div>
  );
}

// Error Component
function ErrorStep({ error }: any) {
  return (
    <div className="text-center space-y-4 py-6">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
      <h3 className="text-xl font-bold">Authentication Failed</h3>
      <p className="text-muted-foreground">{error?.message || 'An error occurred'}</p>
    </div>
  );
}

// Main Flow Demo
function CompleteAuthDemo() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleMethodSelect = async (method: string) => {
    setSelectedMethod(method);
    // Simulate navigation delay
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  return (
    <FlowProvider config={completeAuthFlow}>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Authentication</CardTitle>
          <CardDescription>All authentication methods in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthFlow
            renderers={{
              [FlowStep.SIGN_IN]: () => <AuthMethodSelector onSelectMethod={handleMethodSelect} />,
              [FlowStep.EMAIL_PASSWORD_SIGN_IN]: EmailPasswordStep,
              [FlowStep.OAUTH_CALLBACK]: OAuthCallbackStep,
              [FlowStep.MAGIC_LINK_REQUEST]: MagicLinkStep,
              [FlowStep.MAGIC_LINK_SENT]: MagicLinkSentStep,
              [FlowStep.PHONE_REQUEST]: PhoneAuthStep,
              [FlowStep.PHONE_VERIFY]: PhoneVerifyStep,
              [FlowStep.PASSKEY_AUTHENTICATE]: PasskeyAuthStep,
              [FlowStep.MFA_REQUIRED]: MFARequiredStep,
              [FlowStep.MFA_VERIFY]: MFAVerifyStep,
            }}
            loadingComponent={LoadingStep}
            successComponent={SuccessStep}
            errorComponent={ErrorStep}
          />
        </CardContent>
      </Card>
    </FlowProvider>
  );
}

export default function CompleteAuthPage() {
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
                <h1 className="text-xl font-bold">Complete Authentication Flow</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-4">All-in-One Authentication</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A complete authentication system featuring email/password, OAuth (Google, GitHub),
                magic links, phone auth, passkeys, MFA, and logout flows - all in one unified experience.
              </p>
            </div>

            <CompleteAuthDemo />

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Multiple Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Email & Password
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Social Login (OAuth)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Magic Links
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Phone Auth (SMS)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Passkeys/WebAuthn
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Two-Factor Auth (MFA)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Email Verification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Conditional MFA
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Session Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Secure Logout
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unified Interface
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Smart Flow Routing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Loading States
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Error Handling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Responsive Design
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

