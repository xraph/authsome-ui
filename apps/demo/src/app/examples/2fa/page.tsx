'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Smartphone, Mail, Key } from 'lucide-react';
import Link from 'next/link';

export default function TwoFactorPage() {
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
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Two-Factor Authentication (2FA)</h2>
            <p className="text-muted-foreground">
              Add an extra layer of security with time-based one-time passwords (TOTP), SMS codes,
              or email verification.
            </p>
          </div>

          {/* 2FA Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Key className="h-10 w-10 text-primary mb-2" />
                <CardTitle>TOTP (Authenticator App)</CardTitle>
                <CardDescription>
                  Use apps like Google Authenticator or Authy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Most secure method</li>
                  <li>• Works offline</li>
                  <li>• Time-based codes</li>
                  <li>• Industry standard</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>SMS Verification</CardTitle>
                <CardDescription>Receive codes via text message</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Simple and familiar</li>
                  <li>• No app required</li>
                  <li>• Phone number verification</li>
                  <li>• Quick setup</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>Receive codes via email</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No additional device</li>
                  <li>• Easy to implement</li>
                  <li>• Good fallback option</li>
                  <li>• Universal access</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation</CardTitle>
              <CardDescription>How to add 2FA to your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Setup Flow</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{`import { TwoFactorSetup, use2FA } from '@authsome/ui-react-headless';

function SetupPage() {
  const { setup } = use2FA();
  
  return (
    <TwoFactorSetup
      method="totp"
      onComplete={(secret) => {
        // Save secret to user profile
        console.log('2FA enabled with secret:', secret);
      }}
    >
      {({ qrCode, secret, verify }) => (
        <div>
          <img src={qrCode} alt="QR Code" />
          <p>Secret: {secret}</p>
          <button onClick={() => verify(code)}>
            Verify Code
          </button>
        </div>
      )}
    </TwoFactorSetup>
  );
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Verification Flow</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  <code>{`import { TwoFactorForm } from '@/components/ui/card';

function LoginPage() {
  const [needs2FA, setNeeds2FA] = useState(false);
  
  return (
    <>
      {needs2FA ? (
        <TwoFactorForm
          onSuccess={() => router.push('/dashboard')}
          onError={(error) => console.error(error)}
        />
      ) : (
        <SignInForm
          onSuccess={() => setNeeds2FA(true)}
        />
      )}
    </>
  );
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Time-based algorithm (RFC 6238)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Backup codes for recovery</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Rate limiting on verification attempts</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                  </div>
                  <span>Prevents brute force attacks</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">i</span>
                  </div>
                  <span>Auto-paste from clipboard</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">i</span>
                  </div>
                  <span>Remember device option</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">i</span>
                  </div>
                  <span>Clear error messages</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">i</span>
                  </div>
                  <span>Multiple method support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

