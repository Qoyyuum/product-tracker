import { corsHeaders } from '../middleware/cors.js';

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

export function handleError(error: any): Response {
  console.error('API Error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  
  return new Response(JSON.stringify({
    error: message,
    timestamp: Date.now()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

export function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missing: string[] = [];
  
  for (const field of fields) {
    if (!data[field]) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new APIError(`Missing required fields: ${missing.join(', ')}`);
  }
}
