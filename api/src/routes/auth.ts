import { generateToken } from '../middleware/auth.js';
import { generateUUID, hashPassword, verifyPassword, generateKeyPair } from '../blockchain/crypto.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError, validateRequired } from '../utils/errors.js';
import { Env } from '../types.js';

export async function handleAuthRoutes(request: Request, env: Env, action: string): Promise<Response> {
  try {
    switch (action) {
      case 'register':
        return await register(request, env);
      case 'login':
        return await login(request, env);
      case 'verify':
        return await verify(request, env);
      default:
        throw new APIError('Invalid action', 404);
    }
  } catch (error: any) {
    console.error('Auth route error:', error);
    const message = error instanceof APIError ? error.message : 'Internal server error';
    const status = error instanceof APIError ? error.status : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function verifyTurnstile(token: string, env: Env): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  
  const outcome = await result.json() as { success: boolean };
  return outcome.success;
}

async function register(request: Request, env: Env): Promise<Response> {
  const data = await request.json() as Record<string, any>;
  validateRequired(data, ['email', 'password', 'organizationName', 'organizationType', 'turnstileToken']);
  
  const { email, password, organizationName, organizationType, turnstileToken } = data;
  
  // Determine role server-side based on organization type
  const role = organizationType === 'manufacturer' ? 'admin' : 
               organizationType === 'auditor' ? 'auditor' : 
               organizationType === 'operator' ? 'operator' : 'consumer';
  
  const turnstileValid = await verifyTurnstile(turnstileToken, env);
  if (!turnstileValid) {
    throw new APIError('CAPTCHA verification failed', 400);
  }
  
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (existing) {
    throw new APIError('User already exists', 409);
  }
  
  const { publicKey, privateKey } = await generateKeyPair();
  
  const orgId = generateUUID();
  const userId = generateUUID();
  const passwordHash = await hashPassword(password);
  const timestamp = Date.now();
  
  // Execute both inserts atomically
  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO organizations (id, name, type, public_key, created_at, verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(orgId, organizationName, organizationType, publicKey, timestamp, 0),
    env.DB.prepare(`
      INSERT INTO users (id, email, organization_id, role, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, email, orgId, role, passwordHash, timestamp)
  ]);
  
  const token = await generateToken({
    id: userId,
    organization_id: orgId,
    role,
    email
  }, env.JWT_SECRET);
  
  return new Response(JSON.stringify({
    token,
    user: {
      id: userId,
      email,
      organizationId: orgId,
      role
    },
    organization: {
      id: orgId,
      name: organizationName,
      type: organizationType,
      publicKey,
      privateKey
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function login(request: Request, env: Env): Promise<Response> {
  const data = await request.json() as Record<string, any>;
  validateRequired(data, ['email', 'password']);
  
  const { email, password } = data;
  
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (!user) {
    throw new APIError('Invalid credentials', 401);
  }
  
  const valid = await verifyPassword(password, user.password_hash as string);
  if (!valid) {
    throw new APIError('Invalid credentials', 401);
  }
  
  await env.DB.prepare(
    'UPDATE users SET last_login = ? WHERE id = ?'
  ).bind(Date.now(), user.id).run();
  
  const token = await generateToken({
    id: user.id as string,
    organization_id: user.organization_id as string,
    role: user.role as string,
    email: user.email as string
  }, env.JWT_SECRET);
  
  return new Response(JSON.stringify({
    token,
    user: {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function verify(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new APIError('Missing authorization header', 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { validateToken } = await import('../middleware/auth.js');
    const payload = await validateToken(token, env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      valid: true,
      user: payload
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    throw new APIError('Invalid token', 401);
  }
}
