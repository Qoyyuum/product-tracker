/**
 * Authentication middleware using JWT
 */

import { SignJWT, jwtVerify } from 'jose';

/**
 * Generate JWT token for user
 */
export async function generateToken(user, secret) {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);
  
  const token = await new SignJWT({
    userId: user.id,
    orgId: user.organization_id,
    role: user.role,
    email: user.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
  
  return token;
}

/**
 * Validate JWT token
 */
export async function validateToken(token, secret) {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);
    
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract and validate auth from request
 */
export async function validateAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const payload = await validateToken(token, env.JWT_SECRET);
  
  return payload;
}

/**
 * Require specific role(s)
 */
export function requireRole(allowedRoles) {
  return async (request, env) => {
    const auth = await validateAuth(request, env);
    
    if (!allowedRoles.includes(auth.role)) {
      throw new Error('Insufficient permissions');
    }
    
    return auth;
  };
}

/**
 * Optional auth - doesn't fail if no token
 */
export async function optionalAuth(request, env) {
  try {
    return await validateAuth(request, env);
  } catch (error) {
    return null;
  }
}
