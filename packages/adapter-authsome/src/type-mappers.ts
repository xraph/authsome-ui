/**
 * Type mapping utilities between @authsome/client and @authsome/ui-core
 * 
 * Handles conversion between the client SDK types and the UI core types,
 * ensuring proper field mapping, type conversion, and validation.
 */

import type * as ClientTypes from '@authsome/client';
import type {
  User,
  Session,
  AuthResponse,
  SignInRequest as CoreSignInRequest,
  SignUpRequest as CoreSignUpRequest,
} from '@authsome/ui-core';

/**
 * Convert client User to ui-core User
 */
export function mapClientUserToCore(clientUser: ClientTypes.User): User {
  return {
    id: clientUser.id,
    email: clientUser.email,
    name: clientUser.name,
    emailVerified: clientUser.emailVerified ?? false,
    createdAt: clientUser.createdAt ? new Date(clientUser.createdAt) : undefined,
    updatedAt: clientUser.updatedAt ? new Date(clientUser.updatedAt) : undefined,
    organizationId: clientUser.organizationId,
  };
}

/**
 * Convert ui-core User to client User (for updates)
 */
export function mapCoreUserToClient(coreUser: Partial<User>): { email?: string; name?: string } {
  return {
    email: coreUser.email,
    name: coreUser.name,
  };
}

/**
 * Convert client Session to ui-core Session
 */
export function mapClientSessionToCore(clientSession: ClientTypes.Session): Session {
  return {
    id: clientSession.id,
    userId: clientSession.userId,
    token: clientSession.token,
    expiresAt: clientSession.expiresAt ? new Date(clientSession.expiresAt) : undefined,
    createdAt: clientSession.createdAt ? new Date(clientSession.createdAt) : undefined,
    metadata: {
      ipAddress: clientSession.ipAddress,
      userAgent: clientSession.userAgent,
    },
  };
}

/**
 * Convert client auth response to ui-core AuthResponse
 */
export function mapClientAuthResponseToCore(
  response: { user: ClientTypes.User; session: ClientTypes.Session; requiresTwoFactor?: boolean }
): AuthResponse {
  const authResponse: AuthResponse = {
    user: mapClientUserToCore(response.user),
    session: mapClientSessionToCore(response.session),
  };

  if (response.requiresTwoFactor) {
    authResponse.requiresTwoFactor = true;
  }

  return authResponse;
}

/**
 * Convert ui-core SignInRequest to client format
 */
export function mapCoreSignInRequestToClient(
  request: CoreSignInRequest
): { email: string; password: string } {
  // The client expects email and password
  const email = request.email || request.username || request.phone || '';
  const password = request.password || '';
  
  return {
    email,
    password,
  };
}

/**
 * Convert ui-core SignUpRequest to client format
 */
export function mapCoreSignUpRequestToClient(
  request: CoreSignUpRequest
): { email: string; password: string; name?: string } {
  const email = request.email || request.username || request.phone || '';
  const name = request.name || 
    (request.firstName && request.lastName 
      ? `${request.firstName} ${request.lastName}` 
      : request.firstName || request.lastName);
  
  return {
    email,
    password: request.password,
    ...(name && { name }),
  };
}

/**
 * Convert client Device to a simpler format for lists
 */
export function mapClientDeviceToCore(
  clientDevice: ClientTypes.Device
): {
  id: string;
  userId: string;
  name?: string;
  type?: string;
  lastUsedAt: string;
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    id: clientDevice.id,
    userId: clientDevice.userId,
    name: clientDevice.name,
    type: clientDevice.type,
    lastUsedAt: clientDevice.lastUsedAt,
    ipAddress: clientDevice.ipAddress,
    userAgent: clientDevice.userAgent,
  };
}

/**
 * Safe date parser that handles both Date objects and ISO strings
 */
export function parseDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  try {
    return new Date(value);
  } catch {
    return undefined;
  }
}

/**
 * Extract token from various response formats
 */
export function extractToken(
  response: { session?: { token?: string }; token?: string } | null
): string | null {
  if (!response) return null;
  
  // Try session.token first
  if (response.session?.token) {
    return response.session.token;
  }
  
  // Try direct token field
  if (response.token) {
    return response.token;
  }
  
  return null;
}

