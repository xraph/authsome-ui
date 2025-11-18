/**
 * Dashboard Client Component
 * 
 * Handles client-side interactivity for the dashboard
 * Receives server-validated user and session data as props
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Mail, Clock, Key, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  user: any;
  session: any;
}

export function DashboardClient({ user, session }: DashboardClientProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call sign out API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to home page
        router.push('/');
        router.refresh(); // Refresh server components
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome */}
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h2>
            <p className="text-muted-foreground">
              You're successfully authenticated. This is a protected page.
            </p>
          </div>

          {/* User Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{user?.email || 'Not available'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Key className="h-4 w-4" />
                    User ID
                  </div>
                  <p className="font-mono text-sm break-all">{user?.id || 'Not available'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Account Created
                  </div>
                  <p className="text-sm">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="font-medium">Active</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Session ID</div>
                  <p className="font-mono text-xs break-all">
                    {session?.id ? session.id.substring(0, 16) + '...' : 'Not available'}
                  </p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Expires</div>
                  <p className="text-sm">
                    {session?.expiresAt
                      ? new Date(session.expiresAt).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/auth/change-password')}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h4 className="font-medium mb-1">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </button>
                <button 
                  onClick={() => router.push('/auth/2fa')}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h4 className="font-medium mb-1">Enable 2FA</h4>
                  <p className="text-sm text-muted-foreground">Add extra security</p>
                </button>
                <button 
                  onClick={() => router.push('/settings/sessions')}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h4 className="font-medium mb-1">Manage Sessions</h4>
                  <p className="text-sm text-muted-foreground">View active sessions</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Integration Example */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Example</CardTitle>
              <CardDescription>How this page is protected</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code>{`// Server Component with server-side auth
import { authServer } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Validate session on the server
  const user = await authServer.getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  return <DashboardContent user={user} />;
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

