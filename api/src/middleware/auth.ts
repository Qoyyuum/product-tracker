import { SignJWT, jwtVerify } from 'jose';
import { AuthPayload, Env } from '../types.js';
import { APIError } from '../utils/errors.js';

interface UserTokenData {
  id: string;
  organization_id: string;
  role: string;
  email: string;
}

export async function generateToken(user: UserTokenData, secret: string): Promise<string> {
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

export async function validateToken(token: string, secret: string): Promise<AuthPayload> {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);
    
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      orgId: payload.orgId as string,
      role: payload.role as string,
      email: payload.email as string
    };
  } catch (error) {
    throw new APIError('Invalid or expired token', 401);
  }
}

export async function validateAuth(request: Request, env: Env): Promise<AuthPayload> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new APIError('Missing or invalid authorization header', 401);
  }
  
  const token = authHeader.substring(7);
  const payload = await validateToken(token, env.JWT_SECRET);
  
  return payload;
}

export function requireRole(allowedRoles: string[]) {
  return async (request: Request, env: Env): Promise<AuthPayload> => {
    const auth = await validateAuth(request, env);
    
    if (!allowedRoles.includes(auth.role)) {
      throw new APIError('Insufficient permissions', 403);
    }
    
    return auth;
  };
}

export async function optionalAuth(request: Request, env: Env): Promise<AuthPayload | null> {
  try {
    return await validateAuth(request, env);
  } catch (error) {
    return null;
  }
}
