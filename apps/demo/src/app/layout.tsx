import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuthSome UI Demo',
  description: 'Demo application for AuthSome UI authentication toolkit',
};

/**
 * Root Layout
 * 
 * Note: NextAuthProvider is added in the /auth layout for auth pages only.
 * For non-auth pages that need auth, add the provider to their specific layouts.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

