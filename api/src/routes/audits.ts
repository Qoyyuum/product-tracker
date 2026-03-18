import { validateAuth } from '../middleware/auth.js';
import { generateUUID, verifySignature } from '../blockchain/crypto.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError, validateRequired } from '../utils/errors.js';
import { Env } from '../types.js';

export async function handleAuditRoutes(request: Request, env: Env, action: string): Promise<Response> {
  try {
    switch (action) {
      case 'getPending':
        return await getPendingAudits(request, env);
      case 'create':
        return await createAudit(request, env);
      case 'update':
        return await updateAudit(request, env);
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

async function getPendingAudits(request: Request, env: Env): Promise<Response> {
  const auth = await validateAuth(request, env);
  
  if (auth.role !== 'auditor' && auth.role !== 'admin') {
    throw new APIError('Insufficient permissions', 403);
  }
  
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const limit = parseInt(url.searchParams.get('limit') || '50');
  
  const audits = await env.DB.prepare(`
    SELECT a.*, p.product_name, p.batch_id, o.name as auditor_name
    FROM audit_records a
    JOIN products p ON a.product_id = p.id
    JOIN organizations o ON a.auditor_id = o.id
    WHERE a.status = ?
    ORDER BY a.timestamp DESC
    LIMIT ?
  `).bind(status, limit).all();
  
  return new Response(JSON.stringify({
    audits: audits.results,
    count: audits.results.length
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function createAudit(request: Request, env: Env): Promise<Response> {
  const auth = await validateAuth(request, env);
  
  if (auth.role !== 'auditor' && auth.role !== 'admin') {
    throw new APIError('Insufficient permissions', 403);
  }
  
  const data = await request.json() as Record<string, any>;
  validateRequired(data, ['productId', 'status', 'signature']);
  
  const { productId, stageId, status, notes, signature, signedData } = data;
  
  const product = await env.DB.prepare(
    'SELECT id FROM products WHERE id = ?'
  ).bind(productId).first();
  
  if (!product) {
    throw new APIError('Product not found', 404);
  }
  
  const auditId = generateUUID();
  const timestamp = Date.now();
  
  const auditData = {
    auditId,
    productId,
    stageId: stageId || null,
    auditorId: auth.orgId,
    status,
    notes: notes || '',
    timestamp
  };
  
  const dataToVerify = signedData || JSON.stringify(auditData);
  
  const org = await env.DB.prepare(
    'SELECT public_key FROM organizations WHERE id = ?'
  ).bind(auth.orgId).first();
  
  if (!org || !org.public_key) {
    throw new APIError('Organization public key not found', 400);
  }
  
  const isValid = await verifySignature(dataToVerify, signature, org.public_key as string);
  
  if (!isValid) {
    throw new APIError('Invalid signature', 403);
  }
  
  await env.DB.prepare(`
    INSERT INTO audit_records (id, product_id, stage_id, auditor_id, status, notes, signature, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    auditId,
    productId,
    stageId || null,
    auth.orgId,
    status,
    notes || '',
    signature,
    timestamp
  ).run();
  
  await env.DB.prepare(`
    INSERT INTO analytics_events (id, event_type, product_id, timestamp)
    VALUES (?, ?, ?, ?)
  `).bind(generateUUID(), 'audit_created', productId, Date.now()).run();
  
  return new Response(JSON.stringify({
    auditId,
    status,
    timestamp,
    message: 'Audit record created successfully'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function updateAudit(request: Request, env: Env): Promise<Response> {
  const auth = await validateAuth(request, env);
  
  if (auth.role !== 'auditor' && auth.role !== 'admin') {
    throw new APIError('Insufficient permissions', 403);
  }
  
  const url = new URL(request.url);
  const auditId = url.pathname.split('/')[3];
  const data = await request.json() as Record<string, any>;
  
  const audit = await env.DB.prepare(
    'SELECT * FROM audit_records WHERE id = ?'
  ).bind(auditId).first();
  
  if (!audit) {
    throw new APIError('Audit not found', 404);
  }
  
  if (audit.auditor_id !== auth.orgId && auth.role !== 'admin') {
    throw new APIError('Cannot update another auditor\'s record', 403);
  }
  
  const { status, notes, signature, signedData } = data;
  
  let finalSignature = audit.signature as string;
  
  if (signature) {
    const updateData = {
      auditId,
      status: status || audit.status,
      notes: notes || audit.notes,
      timestamp: Date.now()
    };
    
    const dataToVerify = signedData || JSON.stringify(updateData);
    
    const org = await env.DB.prepare(
      'SELECT public_key FROM organizations WHERE id = ?'
    ).bind(auth.orgId).first();
    
    if (!org || !org.public_key) {
      throw new APIError('Organization public key not found', 400);
    }
    
    const isValid = await verifySignature(dataToVerify, signature, org.public_key as string);
    
    if (!isValid) {
      throw new APIError('Invalid signature', 403);
    }
    
    finalSignature = signature;
  }
  
  await env.DB.prepare(`
    UPDATE audit_records 
    SET status = ?, notes = ?, signature = ?, timestamp = ?
    WHERE id = ?
  `).bind(
    status || audit.status,
    notes || audit.notes,
    finalSignature,
    Date.now(),
    auditId
  ).run();
  
  return new Response(JSON.stringify({
    auditId,
    status: status || audit.status,
    message: 'Audit record updated successfully'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
