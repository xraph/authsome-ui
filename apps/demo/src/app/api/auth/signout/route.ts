/**
 * Sign Out API Route
 * 
 * POST /api/auth/signout
 * Signs out the current user and clears their session
 */

import { authServer } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Sign out and clear session
    const result = await authServer.signOut();

    return NextResponse.json({ 
      success: true,
      redirect: result.redirect || '/' 
    });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}

