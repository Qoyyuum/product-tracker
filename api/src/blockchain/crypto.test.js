import { describe, it, expect } from 'vitest';
import { generateUUID, calculateHash, generateKeyPair, signData, verifySignature } from './crypto.js';

describe('Crypto Utilities', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('calculateHash', () => {
    it('should generate consistent hash for same input', async () => {
      const input = 'test data';
      const hash1 = await calculateHash(input);
      const hash2 = await calculateHash(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', async () => {
      const hash1 = await calculateHash('data1');
      const hash2 = await calculateHash('data2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64-character hex string', async () => {
      const hash = await calculateHash('test');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('Key Pair Generation', () => {
    it('should generate valid key pair', async () => {
      const { publicKey, privateKey } = await generateKeyPair();
      
      expect(publicKey).toBeDefined();
      expect(privateKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
      expect(typeof privateKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(0);
      expect(privateKey.length).toBeGreaterThan(0);
    });

    it('should generate unique key pairs', async () => {
      const pair1 = await generateKeyPair();
      const pair2 = await generateKeyPair();
      
      expect(pair1.publicKey).not.toBe(pair2.publicKey);
      expect(pair1.privateKey).not.toBe(pair2.privateKey);
    });
  });

  describe('Digital Signatures', () => {
    it('should sign and verify data correctly', async () => {
      const { publicKey, privateKey } = await generateKeyPair();
      const data = 'important message';
      
      const signature = await signData(data, privateKey);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      
      const isValid = await verifySignature(data, signature, publicKey);
      expect(isValid).toBe(true);
    });

    it('should reject tampered data', async () => {
      const { publicKey, privateKey } = await generateKeyPair();
      const originalData = 'original message';
      const tamperedData = 'tampered message';
      
      const signature = await signData(originalData, privateKey);
      const isValid = await verifySignature(tamperedData, signature, publicKey);
      
      expect(isValid).toBe(false);
    });

    it('should reject signature from different key', async () => {
      const pair1 = await generateKeyPair();
      const pair2 = await generateKeyPair();
      const data = 'message';
      
      const signature = await signData(data, pair1.privateKey);
      const isValid = await verifySignature(data, signature, pair2.publicKey);
      
      expect(isValid).toBe(false);
    });
  });
});
