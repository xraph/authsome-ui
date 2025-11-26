'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

export default function ExamplesPage() {
  const examples = [
    {
      title: 'Built-in Renderers',
      description: 'Production-ready UI with ZERO custom code - just pass your components!',
      path: '/examples/built-in-renderers',
      status: 'New',
      featured: true,
    },
    {
      title: 'Complete Auth System',
      description: 'All-in-one: Email, OAuth, Magic Link, Phone, Passkey, MFA & Logout',
      path: '/examples/complete-auth',
      status: 'Ready',
    },
    {
      title: 'Dynamic Flows',
      description: 'Multi-step authentication flows with conditional logic',
      path: '/examples/dynamic-flow',
      status: 'Ready',
    },
    {
      title: 'Email/Password',
      description: 'Traditional email and password authentication',
      path: '/examples/email-password',
      status: 'Ready',
    },
    {
      title: 'OAuth Providers',
      description: 'Sign in with Google, GitHub, and more',
      path: '/examples/oauth',
      status: 'Ready',
    },
    {
      title: 'Magic Links',
      description: 'Passwordless authentication via email',
      path: '/examples/magic-link',
      status: 'Ready',
    },
    {
      title: 'Password Reset',
      description: 'Complete forgot password and reset flow',
      path: '/examples/password-reset',
      status: 'New',
      featured: true,
    },
    {
      title: 'Email Verification',
      description: 'Code and link-based email verification',
      path: '/examples/email-verification',
      status: 'New',
      featured: true,
    },
    {
      title: 'Two-Factor Auth',
      description: 'TOTP, SMS, and email-based 2FA',
      path: '/examples/2fa',
      status: 'Demo',
    },
    {
      title: 'Phone Authentication',
      description: 'SMS-based phone number verification',
      path: '/examples/phone',
      status: 'Demo',
    },
    {
      title: 'Username Auth',
      description: 'Username-based authentication',
      path: '/examples/username',
      status: 'Demo',
    },
    {
      title: 'Passkeys/WebAuthn',
      description: 'Biometric authentication with passkeys',
      path: '/examples/passkey',
      status: 'Demo',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Examples</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Authentication Examples</h2>
          <p className="text-muted-foreground mb-8">
            Explore different authentication flows and see how to implement them in your
            application.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {examples.map((example) => (
              <Link key={example.path} href={example.path}>
                <Card className={`hover:bg-accent transition-colors cursor-pointer h-full ${example.featured ? 'border-primary' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className={example.featured ? 'text-primary' : ''}>
                        {example.title}
                      </CardTitle>
                      <span className={`text-xs px-2 py-1 rounded ${
                        example.status === 'New' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {example.status}
                      </span>
                    </div>
                    <CardDescription>{example.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

