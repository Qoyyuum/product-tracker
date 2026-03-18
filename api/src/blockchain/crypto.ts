import { KeyPair } from '../types.js';

export async function calculateHash(data: any): Promise<string> {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  const msgBuffer = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    true,
    ["sign", "verify"]
  ) as CryptoKeyPair;
  
  const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  
  return { 
    publicKey: JSON.stringify(publicKey), 
    privateKey: JSON.stringify(privateKey) 
  };
}

export async function signData(data: any, privateKeyJWK: string): Promise<string> {
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

export async function verifySignature(data: any, signature: string, publicKeyJWK: string): Promise<boolean> {
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

export function generateUUID(): string {
  return crypto.randomUUID();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function hashPassword(password: string, salt: string | null = null): Promise<string> {
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

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt] = storedHash.split(':');
  const newHash = await hashPassword(password, salt);
  return newHash === storedHash;
}
