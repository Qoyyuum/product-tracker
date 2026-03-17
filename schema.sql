-- Organizations (manufacturers, auditors, certifiers)
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('manufacturer', 'auditor', 'certifier')),
  public_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  verified INTEGER DEFAULT 0,
  contact_email TEXT,
  location TEXT
);

-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  organization_id TEXT,
  role TEXT NOT NULL CHECK(role IN ('admin', 'operator', 'auditor', 'consumer')),
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login INTEGER,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Products (immutable records)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  manufacturer_id TEXT NOT NULL,
  category TEXT,
  qr_hash TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  merkle_root TEXT,
  description TEXT,
  FOREIGN KEY (manufacturer_id) REFERENCES organizations(id)
);

-- Process stages (append-only, forms the blockchain)
CREATE TABLE process_stages (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  location TEXT,
  timestamp INTEGER NOT NULL,
  recorded_by TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  current_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  metadata TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Audit records (cryptographically signed)
CREATE TABLE audit_records (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  stage_id TEXT,
  auditor_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('approved', 'rejected', 'pending')),
  notes TEXT,
  signature TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (stage_id) REFERENCES process_stages(id),
  FOREIGN KEY (auditor_id) REFERENCES organizations(id)
);

-- Certifications
CREATE TABLE certifications (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  cert_type TEXT NOT NULL,
  cert_number TEXT,
  issuer_id TEXT NOT NULL,
  issued_at INTEGER NOT NULL,
  expires_at INTEGER,
  signature TEXT NOT NULL,
  metadata TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (issuer_id) REFERENCES organizations(id)
);

-- QR code mappings (for quick lookup)
CREATE TABLE qr_mappings (
  qr_hash TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  scan_count INTEGER DEFAULT 0,
  last_scanned INTEGER,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Merkle tree checkpoints (for batch verification)
CREATE TABLE merkle_checkpoints (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  product_count INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  signature TEXT NOT NULL
);

-- Analytics events
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  product_id TEXT,
  timestamp INTEGER NOT NULL,
  country TEXT,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_products_batch ON products(batch_id);
CREATE INDEX idx_products_qr ON products(qr_hash);
CREATE INDEX idx_stages_product ON process_stages(product_id);
CREATE INDEX idx_stages_timestamp ON process_stages(timestamp);
CREATE INDEX idx_audits_product ON audit_records(product_id);
CREATE INDEX idx_audits_status ON audit_records(status);
CREATE INDEX idx_audits_auditor ON audit_records(auditor_id);
CREATE INDEX idx_certifications_product ON certifications(product_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
