/**
 * Cryptographic utilities for blockchain-like guarantees
 * Uses Web Crypto API for hash chains and digital signatures
 */

/**
 * Calculate SHA-256 hash of data
 */
export async function calculateHash(data) {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  const msgBuffer = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate ECDSA key pair for organization
 */
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    true,
    ["sign", "verify"]
  );
  
  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  
  return { 
    publicKey: JSON.stringify(publicKey), 
    privateKey: JSON.stringify(privateKey) 
  };
}

/**
 * Sign data with private key
 */
export async function signData(data, privateKeyJWK) {
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(privateKeyJWK),
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    false,
    ["sign"]
  );
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
  
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    },
    privateKey,
    dataBuffer
  );
  
  return arrayBufferToBase64(signature);
}

/**
 * Verify signature with public key
 */
export async function verifySignature(data, signature, publicKeyJWK) {
  try {
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(publicKeyJWK),
      {
        name: "ECDSA",
        namedCurve: "P-256"
      },
      false,
      ["verify"]
    );
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
    const signatureBuffer = base64ToArrayBuffer(signature);
    
    return await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" }
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate random UUID
 */
export function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Hash password using PBKDF2
 */
export async function hashPassword(password, salt = null) {
  const actualSalt = salt || crypto.randomUUID();
  const encoder = new TextEncoder();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(actualSalt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${actualSalt}:${hashHex}`;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const newHash = await hashPassword(password, salt);
  return newHash === storedHash;
}
