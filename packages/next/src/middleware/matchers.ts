/**
 * Route matching utilities for middleware
 * Supports exact matches and wildcard patterns
 */

/**
 * Check if pathname matches a pattern
 * Supports wildcards: /api/* matches /api/users, /api/posts, etc.
 * Supports glob patterns: /api/** matches /api/users/123/posts
 * 
 * @param pathname - URL pathname to check
 * @param pattern - Pattern to match against
 * @returns True if pathname matches pattern
 */
export function matchesPattern(pathname: string, pattern: string): boolean {
  // Exact match
  if (pathname === pattern) {
    return true;
  }

  // Wildcard at end: /api/*
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2);
    return pathname.startsWith(base + '/');
  }

  // Glob pattern: /api/**
  if (pattern.endsWith('/**')) {
    const base = pattern.slice(0, -3);
    return pathname.startsWith(base + '/') || pathname === base;
  }

  // Wildcard in middle: /api/*/users
  if (pattern.includes('/*')) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '[^/]+').replace(/\//g, '\\/') + '$'
    );
    return regex.test(pathname);
  }

  return false;
}

/**
 * Check if pathname matches any pattern in array
 * 
 * @param pathname - URL pathname to check
 * @param patterns - Array of patterns
 * @returns True if pathname matches any pattern
 */
export function matchesAnyPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => matchesPattern(pathname, pattern));
}

/**
 * Check if pathname is a public route
 * 
 * @param pathname - URL pathname to check
 * @param publicRoutes - Array of public route patterns
 * @returns True if route is public
 */
export function isPublicRoute(pathname: string, publicRoutes: string[] = []): boolean {
  if (publicRoutes.length === 0) {
    return false;
  }

  return matchesAnyPattern(pathname, publicRoutes);
}

/**
 * Check if pathname is an auth route
 * 
 * @param pathname - URL pathname to check
 * @param basePath - Auth base path (default: '/auth')
 * @returns True if route is an auth page
 */
export function isAuthRoute(pathname: string, basePath: string = '/auth'): boolean {
  const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return pathname.startsWith(cleanBasePath);
}

/**
 * Check if pathname matches configured auth routes
 * 
 * @param pathname - URL pathname to check
 * @param authRoutes - Array of auth route patterns
 * @returns True if pathname is in authRoutes
 */
export function isConfiguredAuthRoute(pathname: string, authRoutes: string[] = []): boolean {
  if (authRoutes.length === 0) {
    return false;
  }

  return matchesAnyPattern(pathname, authRoutes);
}

/**
 * Extract Next.js special paths that should be ignored
 * 
 * @param pathname - URL pathname to check
 * @returns True if should be ignored by middleware
 */
export function isNextSpecialPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/.well-known')
  );
}

/**
 * Check if pathname is a static asset
 * 
 * @param pathname - URL pathname to check
 * @returns True if static asset
 */
export function isStaticAsset(pathname: string): boolean {
  const staticExtensions = [
    '.css', '.js', '.json', '.xml', '.txt',
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp4', '.webm', '.ogg', '.mp3', '.wav',
    '.pdf', '.zip', '.tar', '.gz',
  ];

  return staticExtensions.some(ext => pathname.endsWith(ext));
}

/**
 * Normalize pathname for comparison
 * Removes trailing slashes and ensures leading slash
 * 
 * @param pathname - URL pathname
 * @returns Normalized pathname
 */
export function normalizePath(pathname: string): string {
  let normalized = pathname.trim();
  
  // Ensure leading slash
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * Check if request should be handled by auth middleware
 * Excludes Next.js special paths and static assets
 * 
 * @param pathname - URL pathname
 * @returns True if should be processed by middleware
 */
export function shouldProcessRequest(pathname: string): boolean {
  return !isNextSpecialPath(pathname) && !isStaticAsset(pathname);
}

