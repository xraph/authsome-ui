/**
 * Protected Dashboard Page - Server Component
 * 
 * This page demonstrates:
 * - Server-side session validation
 * - Automatic redirect if not authenticated (via middleware)
 * - Server-side user data fetching
 * - Client components for interactive features
 */

import { redirect } from 'next/navigation';
import { authServer } from '@/lib/auth-server';
import { DashboardClient } from './dashboard-client';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  
  // Server-side authentication check
  // This runs on every request, ensuring fresh session data
  const user = await authServer.getUser(cookieStore);
  const session = await authServer.getSession(cookieStore);

  console.log('user ===> ', user);
  console.log('session ===> ', session);

  // Redirect to signin if not authenticated
  // (Middleware should handle this, but double-check here)
  if (!user) {
    // redirect('/auth/signin');
  }

  // Pass server data to client component
  return <DashboardClient user={user} session={session} />;
}

