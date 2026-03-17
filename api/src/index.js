import { Router } from 'itty-router';
import { handleProductRoutes } from './routes/products.js';
import { handleAuditRoutes } from './routes/audits.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handleQRRoutes } from './routes/qr.js';
import { corsHeaders, handleCORS } from './middleware/cors.js';
import { handleError } from './utils/errors.js';

const router = Router();

// CORS preflight
router.options('*', handleCORS);

// Health check
router.get('/v1/health', async (request, env) => {
  try {
    await env.DB.prepare('SELECT 1').first();
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});

// Auth routes
router.post('/v1/auth/register', (req, env) => handleAuthRoutes(req, env, 'register'));
router.post('/v1/auth/login', (req, env) => handleAuthRoutes(req, env, 'login'));
router.post('/v1/auth/verify', (req, env) => handleAuthRoutes(req, env, 'verify'));

// Public product routes
router.get('/v1/product/:qr', (req, env) => handleProductRoutes(req, env, 'getByQR'));
router.get('/v1/verify/:productId', (req, env) => handleProductRoutes(req, env, 'verifyChain'));

// Protected product routes (require auth)
router.post('/v1/products', (req, env) => handleProductRoutes(req, env, 'register'));
router.post('/v1/products/:id/stages', (req, env) => handleProductRoutes(req, env, 'addStage'));
router.get('/v1/products', (req, env) => handleProductRoutes(req, env, 'list'));
router.get('/v1/products/:id', (req, env) => handleProductRoutes(req, env, 'getById'));

// QR code routes
router.post('/v1/qr/generate', (req, env) => handleQRRoutes(req, env, 'generate'));
router.get('/v1/qr/:hash', (req, env) => handleQRRoutes(req, env, 'get'));

// Audit routes
router.get('/v1/audits/pending', (req, env) => handleAuditRoutes(req, env, 'getPending'));
router.post('/v1/audits', (req, env) => handleAuditRoutes(req, env, 'create'));
router.put('/v1/audits/:id', (req, env) => handleAuditRoutes(req, env, 'update'));

// 404 handler
router.all('*', () => new Response('Not Found', { 
  status: 404,
  headers: corsHeaders
}));

export default {
  async fetch(request, env, ctx) {
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      return handleError(error);
    }
  }
};
