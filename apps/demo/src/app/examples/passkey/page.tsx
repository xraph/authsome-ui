'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Fingerprint } from 'lucide-react';
import Link from 'next/link';

export default function PasskeyPage() {
  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-xl font-bold">Passkey Authentication</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Passkey / WebAuthn Authentication</h2>
            <p className="text-muted-foreground">
              Modern biometric authentication using FIDO2/WebAuthn standards. No passwords required.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <Fingerprint className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Implementation</CardTitle>
              <CardDescription>How to add passkey authentication to your app</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code>{`import { PasskeyPrompt } from '@/components/ui/card';

export default function PasskeyLogin() {
  return (
    <PasskeyPrompt
      onSuccess={() => router.push('/dashboard')}
      onError={(error) => console.error(error)}
    />
  );
}`}</code>
              </pre>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Biometric</CardTitle>
                <CardDescription>Face ID, Touch ID, Windows Hello</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>• Most secure method</div>
                <div>• Best user experience</div>
                <div>• Platform native</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Keys</CardTitle>
                <CardDescription>Hardware tokens like YubiKey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>• Physical device</div>
                <div>• Phishing resistant</div>
                <div>• Enterprise ready</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform</CardTitle>
                <CardDescription>Device authenticators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>• PIN or biometric</div>
                <div>• Device bound</div>
                <div>• No sync required</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Advantages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Phishing resistant - cryptographic proof</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>No passwords to manage or leak</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Fast and convenient authentication</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Industry standard (FIDO2/WebAuthn)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Chrome/Edge</span>
                  <span className="text-green-600 dark:text-green-400">✓ Full support</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safari</span>
                  <span className="text-green-600 dark:text-green-400">✓ Full support</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Firefox</span>
                  <span className="text-green-600 dark:text-green-400">✓ Full support</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mobile browsers</span>
                  <span className="text-green-600 dark:text-green-400">✓ iOS 14+, Android</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

