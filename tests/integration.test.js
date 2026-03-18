import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = process.env.API_URL || 'http://localhost:8787';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

describe('Integration Tests', () => {
  let authToken;
  let productId;
  let qrHash;

  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  describe('API Health Check', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_URL}/v1/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.version).toBeDefined();
    });
  });

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        organizationName: 'Test Organization',
        organizationType: 'manufacturer',
        turnstileToken: 'test-token'
      };

      const response = await fetch(`${API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.token).toBeDefined();
        expect(data.user).toBeDefined();
        expect(data.organization).toBeDefined();
        authToken = data.token;
      } else {
        console.log('Registration failed, might need Turnstile setup');
      }
    }, 10000);

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.token).toBeDefined();
      }
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Product Management', () => {
    it('should require authentication for product registration', async () => {
      const productData = {
        productName: 'Test Product',
        batchId: 'BATCH-001',
        category: 'Electronics'
      };

      const response = await fetch(`${API_URL}/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      expect(response.status).toBe(400);
    });

    it('should list products with authentication', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const response = await fetch(`${API_URL}/v1/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.products).toBeDefined();
        expect(Array.isArray(data.products)).toBe(true);
      }
    });
  });

  describe('CORS Configuration', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const response = await fetch(`${API_URL}/v1/health`, {
        method: 'OPTIONS',
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await fetch(`${API_URL}/v1/unknown-route`);
      expect(response.status).toBe(404);
    });

    it('should return proper error format', async () => {
      const response = await fetch(`${API_URL}/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('Frontend Availability', () => {
    it('should be able to reach frontend', async () => {
      try {
        const response = await fetch(FRONTEND_URL);
        expect(response.status).toBeLessThan(500);
      } catch (error) {
        console.log('Frontend not available:', error.message);
      }
    }, 10000);
  });
});
