# Testing Guide

This document describes how to run tests for the Product Tracker DApp.

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed (for container tests)
- npm packages installed in both `api` and `frontend` directories

## Quick Start

### Install Dependencies

```bash
# Install API dependencies
cd api
npm install

# Install Frontend dependencies
cd ../frontend
npm install

# Install Integration test dependencies
cd ../tests
npm install
```

## Running Tests Locally

### 1. API Unit Tests

```bash
cd api
npm test
```

This runs all TypeScript unit tests for:
- Cryptographic utilities
- Authentication routes
- Blockchain chain verification
- And more

### 2. Frontend Unit Tests

```bash
cd frontend
npm test
```

This runs React component tests for:
- Layout components
- Page components
- Context providers

### 3. TypeScript Type Checking

```bash
cd api
npm run typecheck
```

Validates TypeScript types without emitting files.

### 4. Run All Tests (Local)

**On Windows (PowerShell):**
```powershell
.\test-all.ps1
```

**On Linux/Mac:**
```bash
chmod +x test-all.sh
./test-all.sh
```

This script runs:
1. API unit tests
2. Frontend unit tests
3. TypeScript type checking

## Running Tests with Docker

### 1. Unit Tests in Docker

**API Tests:**
```bash
docker-compose -f docker-compose.test.yml run --rm api-test
```

**Frontend Tests:**
```bash
docker-compose -f docker-compose.test.yml run --rm frontend-test
```

### 2. Integration Tests

Start the services and run integration tests:

```bash
# Start services
docker-compose -f docker-compose.test.yml up -d api frontend

# Wait for services to be ready (10-15 seconds)

# Run integration tests
docker-compose -f docker-compose.test.yml run --rm integration-test

# Clean up
docker-compose -f docker-compose.test.yml down -v
```

### 3. Run All Docker Tests

**On Windows (PowerShell):**
```powershell
.\test-docker.ps1
```

**On Linux/Mac:**
```bash
chmod +x test-docker.sh
./test-docker.sh
```

This script runs:
1. API tests in Docker
2. Frontend tests in Docker
3. Integration tests with running services
4. Automatic cleanup

## Test Structure

### API Tests (`api/src/`)
- `blockchain/crypto.test.ts` - Cryptographic function tests
- `routes/auth.test.ts` - Authentication endpoint tests

### Frontend Tests (`frontend/src/`)
- `components/Layout.test.tsx` - Layout component tests
- `pages/Home.test.tsx` - Home page tests

### Integration Tests (`tests/`)
- `integration.test.js` - End-to-end API integration tests
  - Health checks
  - Authentication flow
  - Product management
  - CORS configuration
  - Error handling

## Docker Compose Configurations

### `docker-compose.yml`
Development environment with hot-reload for both API and frontend.

### `docker-compose.test.yml`
Test environment with:
- Isolated test containers
- Health checks
- Integration test runner
- Automatic cleanup

## Test Coverage

To generate test coverage reports:

```bash
cd api
npm run test:coverage
```

Coverage reports will be generated in `api/coverage/`.

## Continuous Integration

The test suite is designed to run in CI/CD pipelines. Use the test scripts:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm test
  working-directory: ./api

- name: Run Docker Tests
  run: |
    chmod +x test-docker.sh
    ./test-docker.sh
```

## Troubleshooting

### Tests Failing Due to Missing Dependencies
```bash
# Reinstall dependencies
cd api && npm install
cd ../frontend && npm install
cd ../tests && npm install
```

### Docker Tests Failing
```bash
# Clean up Docker resources
docker-compose -f docker-compose.test.yml down -v
docker system prune -f

# Rebuild containers
docker-compose -f docker-compose.test.yml build --no-cache
```

### Port Conflicts
If ports 8787 or 3000 are already in use:
```bash
# Find and kill processes using the ports
# Windows:
netstat -ano | findstr :8787
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8787 | xargs kill -9
```

## Writing New Tests

### API Tests
Create test files with `.test.ts` extension in the appropriate directory:

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### Frontend Tests
Create test files with `.test.tsx` extension:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests
Add tests to `tests/integration.test.js`:

```javascript
describe('My Integration Test', () => {
  it('should test API endpoint', async () => {
    const response = await fetch(`${API_URL}/v1/my-endpoint`);
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Run tests before committing** - Use `test-all.ps1` or `test-all.sh`
2. **Write tests for new features** - Maintain test coverage
3. **Use Docker tests for CI/CD** - Ensures consistent environment
4. **Keep tests isolated** - Each test should be independent
5. **Mock external dependencies** - Use vitest mocks for external services

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
