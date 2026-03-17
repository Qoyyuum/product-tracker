/**
 * Authentication routes
 */

import { generateToken } from '../middleware/auth.js';
import { generateUUID, hashPassword, verifyPassword, generateKeyPair } from '../blockchain/crypto.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError, validateRequired } from '../utils/errors.js';

export async function handleAuthRoutes(request, env, action) {
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status || 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function register(request, env) {
  const data = await request.json();
  validateRequired(data, ['email', 'password', 'organizationName', 'organizationType']);
  
  const { email, password, organizationName, organizationType, role = 'admin' } = data;
  
  // Check if user already exists
  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (existing) {
    throw new APIError('User already exists', 409);
  }
  
  // Generate key pair for organization
  const { publicKey, privateKey } = await generateKeyPair();
  
  // Create organization
  const orgId = generateUUID();
  await env.DB.prepare(`
    INSERT INTO organizations (id, name, type, public_key, created_at, verified)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(orgId, organizationName, organizationType, publicKey, Date.now(), 0).run();
  
  // Create user
  const userId = generateUUID();
  const passwordHash = await hashPassword(password);
  
  await env.DB.prepare(`
    INSERT INTO users (id, email, organization_id, role, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(userId, email, orgId, role, passwordHash, Date.now()).run();
  
  // Generate token
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
      privateKey // Send once during registration - user must store securely
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function login(request, env) {
  const data = await request.json();
  validateRequired(data, ['email', 'password']);
  
  const { email, password } = data;
  
  // Get user
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (!user) {
    throw new APIError('Invalid credentials', 401);
  }
  
  // Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new APIError('Invalid credentials', 401);
  }
  
  // Update last login
  await env.DB.prepare(
    'UPDATE users SET last_login = ? WHERE id = ?'
  ).bind(Date.now(), user.id).run();
  
  // Generate token
  const token = await generateToken({
    id: user.id,
    organization_id: user.organization_id,
    role: user.role,
    email: user.email
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

async function verify(request, env) {
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
