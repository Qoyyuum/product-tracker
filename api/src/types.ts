export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
}

export interface User {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  password_hash: string;
  created_at: number;
  last_login?: number;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  public_key: string;
  created_at: number;
  verified: number;
}

export interface Product {
  id: string;
  batch_id: string;
  product_name: string;
  manufacturer_id: string;
  category: string;
  qr_hash: string;
  created_at: number;
  description?: string;
}

export interface ProcessStage {
  id: string;
  product_id: string;
  stage_name: string;
  location: string;
  timestamp: number;
  recorded_by: string;
  previous_hash: string;
  current_hash: string;
  signature: string;
  metadata: string;
}

export interface Block {
  timestamp: number;
  data: any;
  previousHash: string;
  hash?: string;
  signature?: string;
}

export interface AuthPayload {
  userId: string;
  orgId: string;
  role: string;
  email: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  blockId?: string;
  blockCount?: number;
  verifiedAt?: number;
}

export interface MerkleProofNode {
  hash: string;
  position: 'left' | 'right';
}
