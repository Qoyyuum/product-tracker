/**
 * Hash chain implementation for immutable audit trail
 * Provides blockchain-like guarantees without full blockchain infrastructure
 */

import { calculateHash, signData, verifySignature } from './crypto.js';

/**
 * Create a new block in the product's hash chain
 */
export async function createBlock(data, previousHash, privateKey) {
  const block = {
    timestamp: Date.now(),
    data: data,
    previousHash: previousHash || '0'
  };
  
  block.hash = await calculateHash(block);
  block.signature = await signData(block.hash, privateKey);
  
  return block;
}

/**
 * Verify a single block's integrity
 */
export async function verifyBlock(block, publicKey) {
  const calculatedHash = await calculateHash({
    timestamp: block.timestamp,
    data: block.data,
    previousHash: block.previousHash
  });
  
  if (calculatedHash !== block.hash) {
    return { valid: false, error: 'Hash mismatch' };
  }
  
  const signatureValid = await verifySignature(block.hash, block.signature, publicKey);
  if (!signatureValid) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  return { valid: true };
}

/**
 * Verify entire chain of blocks
 */
export async function verifyChain(blocks, getPublicKey) {
  if (!blocks || blocks.length === 0) {
    return { valid: false, error: 'Empty chain' };
  }
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Verify hash
    const calculatedHash = await calculateHash({
      timestamp: block.timestamp,
      data: JSON.parse(block.metadata || '{}'),
      previousHash: block.previous_hash
    });
    
    if (calculatedHash !== block.current_hash) {
      return { 
        valid: false, 
        error: `Block ${i} hash mismatch`,
        blockId: block.id 
      };
    }
    
    // Verify chain link
    if (i > 0) {
      const previousBlock = blocks[i - 1];
      if (block.previous_hash !== previousBlock.current_hash) {
        return { 
          valid: false, 
          error: `Block ${i} chain broken`,
          blockId: block.id 
        };
      }
    } else {
      // Genesis block should have previousHash of '0'
      if (block.previous_hash !== '0') {
        return { 
          valid: false, 
          error: 'Invalid genesis block',
          blockId: block.id 
        };
      }
    }
    
    // Verify signature
    const publicKey = await getPublicKey(block.recorded_by);
    if (!publicKey) {
      return { 
        valid: false, 
        error: `Cannot find public key for ${block.recorded_by}`,
        blockId: block.id 
      };
    }
    
    const signatureValid = await verifySignature(
      block.current_hash,
      block.signature,
      publicKey
    );
    
    if (!signatureValid) {
      return { 
        valid: false, 
        error: `Block ${i} invalid signature`,
        blockId: block.id 
      };
    }
  }
  
  return { 
    valid: true,
    blockCount: blocks.length,
    verifiedAt: Date.now()
  };
}

/**
 * Get the latest hash in a chain
 */
export function getLatestHash(blocks) {
  if (!blocks || blocks.length === 0) {
    return '0';
  }
  return blocks[blocks.length - 1].current_hash || blocks[blocks.length - 1].hash;
}
