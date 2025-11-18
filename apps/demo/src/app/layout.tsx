import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from '@authsome/ui-next';
import { authConfig } from '@/lib/auth-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuthSome UI Demo',
  description: 'Demo application for AuthSome UI authentication toolkit',
};

/**
 * Root Layout - Wraps entire app with authentication context
 * 
 * The NextAuthProvider provides:
 * - Auth state management
 * - Session synchronization
 * - UI component configuration
 * - Error handling
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider config={authConfig}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}

