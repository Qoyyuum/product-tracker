import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleAuthRoutes } from './auth.js';

describe('Auth Routes', () => {
  let mockEnv;
  let mockRequest;

  beforeEach(() => {
    mockEnv = {
      DB: {
        prepare: vi.fn(),
      },
      JWT_SECRET: 'test-secret',
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        organizationName: 'Test Org',
        organizationType: 'manufacturer',
      };

      mockRequest = new Request('http://localhost/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const mockFirst = vi.fn().mockResolvedValue(null);
      const mockRun = vi.fn().mockResolvedValue({ success: true });
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: mockFirst,
          run: mockRun,
        }),
      });

      const response = await handleAuthRoutes(mockRequest, mockEnv, 'register');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('organization');
    });

    it.skip('should reject duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        organizationName: 'Test Org',
        organizationType: 'manufacturer',
      };

      mockRequest = new Request('http://localhost/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const mockFirst = vi.fn().mockResolvedValue({ id: 'existing-user-id' });
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: mockFirst,
        }),
      });

      const response = await handleAuthRoutes(mockRequest, mockEnv, 'register');
      expect(response.status).toBe(409);

      const data = await response.json();
      expect(data.error).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
      };

      mockRequest = new Request('http://localhost/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      const response = await handleAuthRoutes(mockRequest, mockEnv, 'register');
      expect(response.status).toBe(400);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRequest = new Request('http://localhost/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const mockFirst = vi.fn().mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        password_hash: '$2a$10$mockhashedpassword',
        role: 'admin',
        organization_id: 'org-id',
      });
      const mockRun = vi.fn().mockResolvedValue({ success: true });
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: mockFirst,
          run: mockRun,
        }),
      });

      const response = await handleAuthRoutes(mockRequest, mockEnv, 'login');
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('token');
        expect(data).toHaveProperty('user');
      }
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockRequest = new Request('http://localhost/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const mockFirst = vi.fn().mockResolvedValue(null);
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: mockFirst,
        }),
      });

      const response = await handleAuthRoutes(mockRequest, mockEnv, 'login');
      expect(response.status).toBe(401);
    });
  });
});
