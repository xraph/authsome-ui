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

/**
 * Map OAuth CallbackDataResponse to a simplified format
 * CallbackDataResponse: { action, isNewUser, user }
 */
export function mapCallbackDataResponse(
  response: ClientTypes.CallbackDataResponse
): { action: string; isNewUser: boolean; user: User | null } {
  return {
    action: response.action,
    isNewUser: response.isNewUser,
    user: response.user ? mapClientUserToCore(response.user) : null,
  };
}

/**
 * Map TwoFAStatusResponse to a simplified format
 * TwoFAStatusResponse: { enabled, method, trusted }
 */
export function mapTwoFAStatusResponse(
  response: ClientTypes.TwoFAStatusResponse
): { enabled: boolean; method: string; isTrustedDevice: boolean } {
  return {
    enabled: response.enabled,
    method: response.method,
    isTrustedDevice: response.trusted,
  };
}

/**
 * Map MFAStatus to a rich format with enrolled factors
 * MFAStatus: { enabled, enrolledFactors, gracePeriod, policyActive, requiredCount, trustedDevice }
 */
export function mapMFAStatus(
  response: ClientTypes.MFAStatus
): {
  enabled: boolean;
  enrolledFactors: Array<{ id: string; type: string; name: string }>;
  requiredCount: number;
  isTrustedDevice: boolean;
  policyActive: boolean;
  gracePeriod?: string;
} {
  return {
    enabled: response.enabled,
    enrolledFactors: response.enrolledFactors.map((f) => ({
      id: f.factorId,
      type: f.type,
      name: f.name,
    })),
    requiredCount: response.requiredCount,
    isTrustedDevice: response.trustedDevice,
    policyActive: response.policyActive,
    gracePeriod: response.gracePeriod || undefined,
  };
}

/**
 * Map FactorEnrollmentResponse to a simplified format
 * FactorEnrollmentResponse: { factorId, provisioningData, status, type }
 */
export function mapFactorEnrollmentResponse(
  response: ClientTypes.FactorEnrollmentResponse
): {
  factorId: string;
  type: string;
  status: string;
  provisioningData?: Record<string, unknown>;
} {
  return {
    factorId: response.factorId,
    type: response.type,
    status: response.status,
    provisioningData: response.provisioningData,
  };
}

/**
 * Map ChallengeResponse to a simplified format
 * ChallengeResponse: { availableFactors, challengeId, expiresAt, factorsRequired, sessionId }
 */
export function mapChallengeResponse(
  response: ClientTypes.ChallengeResponse
): {
  challengeId: string;
  sessionId: string;
  factorsRequired: number;
  expiresAt: Date;
  availableFactors: Array<{ factorId: string; type: string; name: string }>;
} {
  return {
    challengeId: response.challengeId,
    sessionId: response.sessionId,
    factorsRequired: response.factorsRequired,
    expiresAt: new Date(response.expiresAt),
    availableFactors: response.availableFactors.map((f) => ({
      factorId: f.factorId,
      type: f.type,
      name: f.name,
    })),
  };
}

/**
 * Map Factor to a standardized MFA factor format
 * Factor: { id, type, name, status, priority, metadata, createdAt, ... }
 */
export function mapFactor(
  factor: ClientTypes.Factor
): {
  id: string;
  type: string;
  name: string;
  status: string;
  priority: string;
  createdAt: Date;
  lastUsedAt?: Date;
  metadata?: Record<string, unknown>;
} {
  return {
    id: factor.id,
    type: factor.type,
    name: factor.name,
    status: factor.status,
    priority: factor.priority,
    createdAt: new Date(factor.createdAt),
    lastUsedAt: factor.lastUsedAt ? new Date(factor.lastUsedAt) : undefined,
    metadata: factor.metadata,
  };
}

/**
 * Map TrustedDevice to a device format
 * TrustedDevice: { id, deviceId, name, userId, createdAt, expiresAt, ... }
 */
export function mapTrustedDevice(
  device: ClientTypes.TrustedDevice
): {
  id: string;
  deviceId: string;
  name: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    id: device.id,
    deviceId: device.deviceId,
    name: device.name,
    userId: device.userId,
    createdAt: new Date(device.createdAt),
    expiresAt: new Date(device.expiresAt),
    lastUsedAt: device.lastUsedAt ? new Date(device.lastUsedAt) : undefined,
    ipAddress: device.ipAddress,
    userAgent: device.userAgent,
  };
}

/**
 * Map PasskeyInfo to a passkey credential format
 * PasskeyInfo: { id, name, credentialId, createdAt, lastUsedAt, ... }
 */
export function mapPasskeyInfo(
  passkey: ClientTypes.PasskeyInfo
): {
  id: string;
  name: string;
  credentialId: string;
  createdAt: Date;
  lastUsedAt?: Date;
  authenticatorType: string;
  isResidentKey: boolean;
} {
  return {
    id: passkey.id,
    name: passkey.name,
    credentialId: passkey.credentialId,
    createdAt: new Date(passkey.createdAt),
    lastUsedAt: passkey.lastUsedAt ? new Date(passkey.lastUsedAt) : undefined,
    authenticatorType: passkey.authenticatorType,
    isResidentKey: passkey.isResidentKey,
  };
}

