import { validateAuth, optionalAuth } from '../middleware/auth.js';
import { generateUUID, calculateHash } from '../blockchain/crypto.js';
import { createBlock, verifyChain } from '../blockchain/chain.js';
import { corsHeaders } from '../middleware/cors.js';
import { APIError, validateRequired } from '../utils/errors.js';
import { Env, ProcessStage } from '../types.js';

export async function handleProductRoutes(request: Request, env: Env, action: string): Promise<Response> {
  try {
    switch (action) {
      case 'register':
        return await registerProduct(request, env);
      case 'addStage':
        return await addProcessStage(request, env);
      case 'getByQR':
        return await getProductByQR(request, env);
      case 'getById':
        return await getProductById(request, env);
      case 'list':
        return await listProducts(request, env);
      case 'verifyChain':
        return await verifyProductChain(request, env);
      default:
        throw new APIError('Invalid action', 404);
    }
  } catch (error: any) {
    console.error('Product route error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function registerProduct(request: Request, env: Env): Promise<Response> {
  const auth = await validateAuth(request, env);
  
  if (!['admin', 'manufacturer', 'operator'].includes(auth.role)) {
    throw new APIError('Insufficient permissions', 403);
  }
  
  const data = await request.json() as Record<string, any>;
  validateRequired(data, ['productName', 'batchId', 'category']);
  
  const { productName, batchId, category, description, privateKey } = data;
  
  if (!privateKey) {
    throw new APIError('Private key required for signing', 400);
  }
  
  const productId = generateUUID();
  const qrHash = await calculateHash(productId + Date.now());
  
  const genesisData = {
    productName,
    batchId,
    category,
    manufacturerId: auth.orgId,
    action: 'Product Registered'
  };
  
  const genesisBlock = await createBlock(genesisData, '0', privateKey);
  const stageId = generateUUID();
  const timestamp = Date.now();
  
  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO products (id, batch_id, product_name, manufacturer_id, category, qr_hash, created_at, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        productId,
        batchId,
        productName,
        auth.orgId,
        category,
        qrHash,
        timestamp,
        description || null
      ),
      env.DB.prepare(`
        INSERT INTO process_stages (id, product_id, stage_name, location, timestamp, recorded_by, previous_hash, current_hash, signature, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        stageId,
        productId,
        'Product Registered',
        data.location || 'Factory',
        genesisBlock.timestamp,
        auth.orgId,
        genesisBlock.previousHash,
        genesisBlock.hash,
        genesisBlock.signature,
        JSON.stringify(genesisData)
      ),
      env.DB.prepare(`
        INSERT INTO qr_mappings (qr_hash, product_id, created_at)
        VALUES (?, ?, ?)
      `).bind(qrHash, productId, timestamp)
    ]);
  } catch (error) {
    console.error('Transaction failed during product registration:', error);
    throw new APIError('Failed to register product', 500);
  }
  
  await env.DB.prepare(`
    INSERT INTO analytics_events (id, event_type, product_id, timestamp)
    VALUES (?, ?, ?, ?)
  `).bind(generateUUID(), 'product_registered', productId, Date.now()).run();
  
  return new Response(JSON.stringify({
    productId,
    qrHash,
    batchId,
    genesisHash: genesisBlock.hash,
    message: 'Product registered successfully'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function addProcessStage(request: Request, env: Env): Promise<Response> {
  const auth = await validateAuth(request, env);
  const url = new URL(request.url);
  const productId = url.pathname.split('/')[3];
  
  const data = await request.json() as Record<string, any>;
  validateRequired(data, ['stageName', 'privateKey']);
  
  const { stageName, location, metadata, privateKey } = data;
  
  const product = await env.DB.prepare(
    'SELECT * FROM products WHERE id = ?'
  ).bind(productId).first();
  
  if (!product) {
    throw new APIError('Product not found', 404);
  }
  
  // Authorization check: verify user's org owns the product or is a participant
  if (product.manufacturer_id !== auth.orgId) {
    const participant = await env.DB.prepare(
      'SELECT id FROM product_participants WHERE product_id = ? AND organization_id = ?'
    ).bind(productId, auth.orgId).first();
    
    if (!participant) {
      throw new APIError('Forbidden: Not authorized to modify this product', 403);
    }
  }
  
  const latestStage = await env.DB.prepare(`
    SELECT current_hash FROM process_stages 
    WHERE product_id = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
  `).bind(productId).first();
  
  const previousHash = latestStage ? (latestStage.current_hash as string) : '0';
  
  const stageData = {
    productId,
    stageName,
    location: location || 'Unknown',
    recordedBy: auth.orgId,
    metadata: metadata || {}
  };
  
  const block = await createBlock(stageData, previousHash, privateKey);
  
  const stageId = generateUUID();
  await env.DB.prepare(`
    INSERT INTO process_stages (id, product_id, stage_name, location, timestamp, recorded_by, previous_hash, current_hash, signature, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    stageId,
    productId,
    stageName,
    location || 'Unknown',
    block.timestamp,
    auth.orgId,
    previousHash,
    block.hash,
    block.signature,
    JSON.stringify(stageData)
  ).run();
  
  return new Response(JSON.stringify({
    stageId,
    hash: block.hash,
    timestamp: block.timestamp,
    message: 'Process stage added successfully'
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function getProductByQR(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const qrHash = url.pathname.split('/')[3];
  
  await env.DB.prepare(`
    UPDATE qr_mappings 
    SET scan_count = scan_count + 1, last_scanned = ? 
    WHERE qr_hash = ?
  `).bind(Date.now(), qrHash).run();
  
  const product = await env.DB.prepare(`
    SELECT p.*, o.name as manufacturer_name, o.type as manufacturer_type
    FROM products p
    JOIN qr_mappings q ON p.id = q.product_id
    JOIN organizations o ON p.manufacturer_id = o.id
    WHERE q.qr_hash = ?
  `).bind(qrHash).first();
  
  if (!product) {
    throw new APIError('Product not found', 404);
  }
  
  const stages = await env.DB.prepare(`
    SELECT ps.*, o.name as recorded_by_name
    FROM process_stages ps
    JOIN organizations o ON ps.recorded_by = o.id
    WHERE ps.product_id = ?
    ORDER BY ps.timestamp ASC
  `).bind(product.id).all();
  
  const certifications = await env.DB.prepare(`
    SELECT c.*, o.name as issuer_name
    FROM certifications c
    JOIN organizations o ON c.issuer_id = o.id
    WHERE c.product_id = ?
  `).bind(product.id).all();
  
  const audits = await env.DB.prepare(`
    SELECT a.*, o.name as auditor_name
    FROM audit_records a
    JOIN organizations o ON a.auditor_id = o.id
    WHERE a.product_id = ?
    ORDER BY a.timestamp DESC
  `).bind(product.id).all();
  
  await env.DB.prepare(`
    INSERT INTO analytics_events (id, event_type, product_id, timestamp)
    VALUES (?, ?, ?, ?)
  `).bind(generateUUID(), 'qr_scan', product.id, Date.now()).run();
  
  return new Response(JSON.stringify({
    product: {
      id: product.id,
      name: product.product_name,
      batchId: product.batch_id,
      category: product.category,
      description: product.description,
      manufacturer: {
        id: product.manufacturer_id,
        name: product.manufacturer_name,
        type: product.manufacturer_type
      },
      createdAt: product.created_at
    },
    stages: stages.results.map((s: any) => ({
      id: s.id,
      name: s.stage_name,
      location: s.location,
      timestamp: s.timestamp,
      recordedBy: {
        id: s.recorded_by,
        name: s.recorded_by_name
      },
      hash: s.current_hash
    })),
    certifications: certifications.results.map((c: any) => ({
      type: c.cert_type,
      number: c.cert_number,
      issuer: c.issuer_name,
      issuedAt: c.issued_at,
      expiresAt: c.expires_at
    })),
    audits: audits.results.map((a: any) => ({
      id: a.id,
      status: a.status,
      auditor: a.auditor_name,
      notes: a.notes,
      timestamp: a.timestamp
    }))
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function getProductById(request: Request, env: Env): Promise<Response> {
  await optionalAuth(request, env);
  const url = new URL(request.url);
  const productId = url.pathname.split('/')[3];
  
  const product = await env.DB.prepare(`
    SELECT p.*, o.name as manufacturer_name
    FROM products p
    JOIN organizations o ON p.manufacturer_id = o.id
    WHERE p.id = ?
  `).bind(productId).first();
  
  if (!product) {
    throw new APIError('Product not found', 404);
  }
  
  const stages = await env.DB.prepare(`
    SELECT * FROM process_stages WHERE product_id = ? ORDER BY timestamp ASC
  `).bind(productId).all();
  
  return new Response(JSON.stringify({
    product,
    stages: stages.results
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function listProducts(request: Request, env: Env): Promise<Response> {
  const auth = await validateAuth(request, env);
  
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  let query = `
    SELECT p.*, o.name as manufacturer_name
    FROM products p
    JOIN organizations o ON p.manufacturer_id = o.id
  `;
  
  if (auth.role !== 'admin') {
    query += ` WHERE p.manufacturer_id = ?`;
  }
  
  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  
  const stmt = auth.role !== 'admin' 
    ? env.DB.prepare(query).bind(auth.orgId, limit, offset)
    : env.DB.prepare(query).bind(limit, offset);
  
  const products = await stmt.all();
  
  return new Response(JSON.stringify({
    products: products.results,
    limit,
    offset
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function verifyProductChain(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const productId = url.pathname.split('/')[3];
  
  const stages = await env.DB.prepare(`
    SELECT * FROM process_stages 
    WHERE product_id = ? 
    ORDER BY timestamp ASC
  `).bind(productId).all();
  
  if (!stages.results || stages.results.length === 0) {
    throw new APIError('No stages found for product', 404);
  }
  
  const getPublicKey = async (orgId: string): Promise<string | undefined> => {
    const org = await env.DB.prepare(
      'SELECT public_key FROM organizations WHERE id = ?'
    ).bind(orgId).first();
    return org?.public_key as string | undefined;
  };
  
  const verification = await verifyChain(stages.results as unknown as ProcessStage[], getPublicKey);
  
  await env.DB.prepare(`
    INSERT INTO analytics_events (id, event_type, product_id, timestamp)
    VALUES (?, ?, ?, ?)
  `).bind(generateUUID(), 'chain_verification', productId, Date.now()).run();
  
  return new Response(JSON.stringify(verification), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
