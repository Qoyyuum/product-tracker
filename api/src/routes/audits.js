/**
 * Audit routes - for quality control and certification
 */

import { validateAuth } from '../middleware/auth.js';
import { generateUUID, signData } from '../blockchain/crypto.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError, validateRequired } from '../utils/errors.js';

export async function handleAuditRoutes(request, env, action) {
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
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status || 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function getPendingAudits(request, env) {
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

async function createAudit(request, env) {
  const auth = await validateAuth(request, env);
  
  if (auth.role !== 'auditor' && auth.role !== 'admin') {
    throw new APIError('Insufficient permissions', 403);
  }
  
  const data = await request.json();
  validateRequired(data, ['productId', 'status', 'privateKey']);
  
  const { productId, stageId, status, notes, privateKey } = data;
  
  // Verify product exists
  const product = await env.DB.prepare(
    'SELECT id FROM products WHERE id = ?'
  ).bind(productId).first();
  
  if (!product) {
    throw new APIError('Product not found', 404);
  }
  
  // Create audit record
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
  
  // Sign the audit
  const signature = await signData(auditData, privateKey);
  
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
  
  // Track analytics
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

async function updateAudit(request, env) {
  const auth = await validateAuth(request, env);
  
  if (auth.role !== 'auditor' && auth.role !== 'admin') {
    throw new APIError('Insufficient permissions', 403);
  }
  
  const auditId = request.params?.id || new URL(request.url).pathname.split('/')[3];
  const data = await request.json();
  
  // Get existing audit
  const audit = await env.DB.prepare(
    'SELECT * FROM audit_records WHERE id = ?'
  ).bind(auditId).first();
  
  if (!audit) {
    throw new APIError('Audit not found', 404);
  }
  
  // Verify ownership
  if (audit.auditor_id !== auth.orgId && auth.role !== 'admin') {
    throw new APIError('Cannot update another auditor\'s record', 403);
  }
  
  const { status, notes, privateKey } = data;
  
  // Create new signature for update
  const updateData = {
    auditId,
    status: status || audit.status,
    notes: notes || audit.notes,
    timestamp: Date.now()
  };
  
  const signature = privateKey ? await signData(updateData, privateKey) : audit.signature;
  
  await env.DB.prepare(`
    UPDATE audit_records 
    SET status = ?, notes = ?, signature = ?, timestamp = ?
    WHERE id = ?
  `).bind(
    status || audit.status,
    notes || audit.notes,
    signature,
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
