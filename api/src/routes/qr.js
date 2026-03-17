/**
 * QR code generation and retrieval routes
 */

import QRCode from 'qrcode';
import { validateAuth } from '../middleware/auth.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError } from '../utils/errors.js';

export async function handleQRRoutes(request, env, action) {
  try {
    switch (action) {
      case 'generate':
        return await generateQRCode(request, env);
      case 'get':
        return await getQRCode(request, env);
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

async function generateQRCode(request, env) {
  const auth = await validateAuth(request, env);
  const data = await request.json();
  
  const { qrHash, productId } = data;
  
  if (!qrHash) {
    throw new APIError('QR hash required', 400);
  }
  
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(qrHash, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 512,
    margin: 2
  });
  
  // Convert data URL to buffer
  const base64Data = qrDataUrl.split(',')[1];
  const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  // Store in R2
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

async function getQRCode(request, env) {
  const qrHash = request.params?.hash || new URL(request.url).pathname.split('/')[3];
  
  // Try to get from R2
  const object = await env.R2_BUCKET.get(`qr/${qrHash}.png`);
  
  if (!object) {
    // Generate on the fly if not found
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
