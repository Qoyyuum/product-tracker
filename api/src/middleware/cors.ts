import { Env } from '../types.js';

function getAllowedOrigins(env: Env): string[] {
  const originsEnv = env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3030';
  return originsEnv.split(',').map(o => o.trim());
}

function getCorsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowedOrigins = getAllowedOrigins(env);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function handleCORS(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  const headers = getCorsHeaders(origin, env);
  return new Response(null, { headers });
}

export function addCORSHeaders(response: Response, request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  const headers = getCorsHeaders(origin, env);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
