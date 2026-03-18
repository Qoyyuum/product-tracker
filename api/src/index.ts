import { Router } from 'itty-router';
import { handleProductRoutes } from './routes/products.js';
import { handleAuditRoutes } from './routes/audits.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handleQRRoutes } from './routes/qr.js';
import { corsHeaders, handleCORS } from './middleware/cors.js';
import { handleError } from './utils/errors.js';
import { Env } from './types.js';

const router = Router();

router.options('*', handleCORS);

router.get('/v1/health', async (_request: Request, env: Env) => {
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
  } catch (error: any) {
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

router.post('/v1/auth/register', (req: Request, env: Env) => handleAuthRoutes(req, env, 'register'));
router.post('/v1/auth/login', (req: Request, env: Env) => handleAuthRoutes(req, env, 'login'));
router.post('/v1/auth/verify', (req: Request, env: Env) => handleAuthRoutes(req, env, 'verify'));

router.get('/v1/product/:qr', (req: Request, env: Env) => handleProductRoutes(req, env, 'getByQR'));
router.get('/v1/verify/:productId', (req: Request, env: Env) => handleProductRoutes(req, env, 'verifyChain'));

router.post('/v1/products', (req: Request, env: Env) => handleProductRoutes(req, env, 'register'));
router.post('/v1/products/:id/stages', (req: Request, env: Env) => handleProductRoutes(req, env, 'addStage'));
router.get('/v1/products', (req: Request, env: Env) => handleProductRoutes(req, env, 'list'));
router.get('/v1/products/:id', (req: Request, env: Env) => handleProductRoutes(req, env, 'getById'));

router.post('/v1/qr/generate', (req: Request, env: Env) => handleQRRoutes(req, env, 'generate'));
router.get('/v1/qr/:hash', (req: Request, env: Env) => handleQRRoutes(req, env, 'get'));

router.get('/v1/audits/pending', (req: Request, env: Env) => handleAuditRoutes(req, env, 'getPending'));
router.post('/v1/audits', (req: Request, env: Env) => handleAuditRoutes(req, env, 'create'));
router.put('/v1/audits/:id', (req: Request, env: Env) => handleAuditRoutes(req, env, 'update'));

router.all('*', () => new Response('Not Found', { 
  status: 404,
  headers: corsHeaders
}));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      return handleError(error);
    }
  }
};
