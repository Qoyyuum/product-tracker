Title: Testing Guide
Slug: testing
Date: 2026-03-18
Modified: 2026-03-18
Category: Documentation
Tags: testing, vitest, unit-tests
Authors: Product Tracker Team
Summary: Comprehensive testing guide for the Product Tracker DApp using Vitest.

# Testing Guide

This document describes how to run tests for the Product Tracker DApp.

## Overview

The project uses **Vitest** for both API and frontend testing, providing fast unit tests with excellent TypeScript support.

## API Tests

### Running Tests

```bash
cd api

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

API tests cover:
- **Authentication routes** (`auth.test.js`)
  - User registration
  - Login with valid/invalid credentials
  - Duplicate email validation
  - Required field validation
  
- **Cryptographic utilities** (`crypto.test.js`)
  - UUID generation
  - SHA-256 hashing
  - ECDSA key pair generation
  - Digital signature creation and verification
  - Tamper detection

### Test Files Location

```
api/
├── src/
│   ├── routes/
│   │   └── auth.test.js
│   └── blockchain/
│       └── crypto.test.js
└── vitest.config.js
```

## Frontend Tests

### Running Tests

```bash
cd frontend

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Frontend tests cover:
- **Layout component** (`Layout.test.tsx`)
  - Navigation rendering
  - Authentication state display
  - Login/Logout button visibility
  - Footer rendering
  
- **Home page** (`Home.test.tsx`)
  - Hero section rendering
  - Search functionality
  - Feature cards display
  - CTA buttons

### Test Files Location

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.test.tsx
│   ├── pages/
│   │   └── Home.test.tsx
│   └── test/
│       └── setup.ts
└── vitest.config.ts
```

## Testing Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```javascript
   it('should register a new user successfully', async () => {
     // Test implementation
   });
   ```

2. **Follow AAA pattern** (Arrange, Act, Assert)
   ```javascript
   // Arrange
   const userData = { email: 'test@example.com', ... };
   
   // Act
   const response = await handleAuthRoutes(request, env, 'register');
   
   // Assert
   expect(response.status).toBe(200);
   ```

3. **Mock external dependencies**
   ```javascript
   const mockEnv = {
     DB: {
       prepare: vi.fn(() => ({
         bind: vi.fn(() => ({
           first: vi.fn(),
         })),
       })),
     },
   };
   ```

4. **Clean up after tests**
   ```javascript
   beforeEach(() => {
     localStorage.clear();
   });
   ```

### Adding New Tests

1. Create test file next to the source file with `.test.js` or `.test.tsx` extension
2. Import testing utilities from `vitest` and `@testing-library/react`
3. Write test cases using `describe` and `it` blocks
4. Run tests to verify they pass

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main` branch

See `.github/workflows/ci-cd.yml` for CI/CD configuration.

## Coverage Reports

Coverage reports are generated in:
- `api/coverage/` - API test coverage
- `frontend/coverage/` - Frontend test coverage

Open `coverage/index.html` in a browser to view detailed coverage reports.

## Troubleshooting

### Tests failing locally but passing in CI

- Ensure you have the latest dependencies: `npm ci`
- Check Node.js version matches CI (v20)
- Clear test cache: `npx vitest --clearCache`

### Mock issues

- Verify mock implementations match actual API responses
- Check that mocks are reset between tests using `beforeEach`

### Timeout errors

- Increase timeout for slow tests:
  ```javascript
  it('slow test', async () => {
    // Test code
  }, 10000); // 10 second timeout
  ```

## Future Test Additions

Consider adding tests for:
- Product registration flow
- QR code generation
- Product verification
- Blockchain signature verification
- Error handling scenarios
- Edge cases and boundary conditions
