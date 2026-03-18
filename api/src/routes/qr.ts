import QRCode from 'qrcode';
import { validateAuth } from '../middleware/auth.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError } from '../utils/errors.js';
import { Env } from '../types.js';

export async function handleQRRoutes(request: Request, env: Env, action: string): Promise<Response> {
  try {
    switch (action) {
      case 'generate':
        return await generateQRCode(request, env);
      case 'get':
        return await getQRCode(request, env);
      default:
        throw new APIError('Invalid action', 404);
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status || 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function generateQRCode(request: Request, env: Env): Promise<Response> {
  await validateAuth(request, env);
  const data = await request.json() as { qrHash: string; productId?: string };
  
  const { qrHash } = data;
  
  if (!qrHash) {
    throw new APIError('QR hash required', 400);
  }
  
  const qrDataUrl = await QRCode.toDataURL(qrHash, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 512,
    margin: 2
  });
  
  const base64Data = qrDataUrl.split(',')[1];
  const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  await env.R2_BUCKET.put(`qr/${qrHash}.png`, buffer, {
    httpMetadata: {
      contentType: 'image/png'
    }
  });
  
  return new Response(JSON.stringify({
    qrHash,
    url: `/v1/qr/${qrHash}`,
    dataUrl: qrDataUrl
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function getQRCode(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const qrHash = url.pathname.split('/')[3];
  
  const object = await env.R2_BUCKET.get(`qr/${qrHash}.png`);
  
  if (!object) {
    const qrDataUrl = await QRCode.toDataURL(qrHash, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2
    });
    
    const base64Data = qrDataUrl.split(',')[1];
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        ...corsHeaders
      }
    });
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000',
      ...corsHeaders
    }
  });
}
