# Getting Started - Product Tracker DApp

Quick start guide to get the product tracker running locally and deploy to Cloudflare.

## Local Development Setup

### 1. Clone and Install

```bash
# Install API dependencies
cd api
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Local D1 Database

```bash
cd api

# Create local D1 database
wrangler d1 create product-tracker-db --local

# Apply schema
wrangler d1 execute product-tracker-db --file=../schema.sql --local
```

### 3. Configure Environment

Create `api/.dev.vars` for local secrets:
```
JWT_SECRET=your-local-secret-key-change-in-production
ADMIN_API_KEY=local-admin-key
```

### 4. Run Development Servers

**Terminal 1 - API:**
```bash
cd api
npm run dev
# API runs on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Test Locally

Visit http://localhost:3000 to see the app running locally.

## Project Structure

```
product_tracker/
├── api/                          # Cloudflare Workers API
│   ├── src/
│   │   ├── index.js             # Main worker entry
│   │   ├── routes/              # API route handlers
│   │   │   ├── products.js      # Product endpoints
│   │   │   ├── audits.js        # Audit endpoints
│   │   │   ├── auth.js          # Authentication
│   │   │   └── qr.js            # QR generation
│   │   ├── blockchain/          # Blockchain logic
│   │   │   ├── chain.js         # Hash chain
│   │   │   ├── crypto.js        # Cryptographic functions
│   │   │   └── merkle.js        # Merkle tree
│   │   ├── middleware/          # Middleware
│   │   │   ├── auth.js          # JWT validation
│   │   │   └── cors.js          # CORS headers
│   │   └── utils/               # Utilities
│   ├── package.json
│   └── wrangler.toml            # Cloudflare config
│
├── frontend/                     # React PWA
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Layout.tsx
│   │   │   └── QRScanner.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── ScanProduct.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ManufacturerDashboard.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── schema.sql                    # D1 database schema
├── README.md                     # Project overview
├── DEPLOYMENT.md                 # Deployment guide
└── GETTING_STARTED.md           # This file
```

## Key Features Implemented

### Blockchain-Like Guarantees
- **Hash Chains**: Each product stage is linked via cryptographic hashes
- **Digital Signatures**: All records are signed using ECDSA (P-256)
- **Merkle Trees**: Batch verification for efficient validation
- **Immutable Audit Trail**: Append-only records in D1 database

### API Endpoints

#### Public Endpoints
- `GET /v1/health` - Health check
- `GET /v1/product/:qr` - Get product by QR hash
- `GET /v1/verify/:productId` - Verify product chain

#### Protected Endpoints (require JWT)
- `POST /v1/auth/register` - Register organization
- `POST /v1/auth/login` - Login
- `POST /v1/products` - Register new product
- `POST /v1/products/:id/stages` - Add process stage
- `GET /v1/products` - List products
- `POST /v1/qr/generate` - Generate QR code
- `POST /v1/audits` - Create audit record
- `GET /v1/audits/pending` - Get pending audits

### Frontend Features
- **QR Scanner**: Camera-based QR code scanning
- **Product Timeline**: Visual representation of product journey
- **Certification Display**: Show halal/quality certifications
- **Authentication**: Login/register for manufacturers and auditors
- **PWA Support**: Installable, offline-capable

## Development Workflow

### Making Changes

1. **API Changes**
   ```bash
   cd api
   # Edit files in src/
   # Wrangler auto-reloads on save
   ```

2. **Frontend Changes**
   ```bash
   cd frontend
   # Edit files in src/
   # Vite auto-reloads on save
   ```

3. **Database Changes**
   ```bash
   # Edit schema.sql
   # Apply changes
   wrangler d1 execute product-tracker-db --file=../schema.sql --local
   ```

### Testing

```bash
# API tests (when implemented)
cd api
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## Common Tasks

### Register a Test Organization

```bash
curl -X POST http://localhost:8787/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manufacturer@example.com",
    "password": "testpass123",
    "organizationName": "Test Foods Inc",
    "organizationType": "manufacturer"
  }'
```

Save the returned `privateKey` - you'll need it to sign products!

### Register a Product

```bash
curl -X POST http://localhost:8787/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productName": "Halal Chicken",
    "batchId": "BATCH001",
    "category": "Food",
    "description": "Fresh halal chicken",
    "location": "Processing Plant A",
    "privateKey": "YOUR_PRIVATE_KEY_FROM_REGISTRATION"
  }'
```

### Add a Process Stage

```bash
curl -X POST http://localhost:8787/v1/products/PRODUCT_ID/stages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stageName": "Quality Check",
    "location": "QC Department",
    "metadata": {"temperature": "4C", "inspector": "John Doe"},
    "privateKey": "YOUR_PRIVATE_KEY"
  }'
```

### Verify Product Chain

```bash
curl http://localhost:8787/v1/verify/PRODUCT_ID
```

## Troubleshooting

### TypeScript Errors in IDE

The TypeScript errors you see are expected before running `npm install`. They will resolve after:
```bash
cd frontend
npm install
```

### Port Already in Use

```bash
# Kill process on port 8787 (API)
npx kill-port 8787

# Kill process on port 3000 (Frontend)
npx kill-port 3000
```

### Database Not Found

```bash
# Recreate local database
cd api
wrangler d1 create product-tracker-db --local
wrangler d1 execute product-tracker-db --file=../schema.sql --local
```

### CORS Issues

If you see CORS errors, ensure:
1. API is running on port 8787
2. Frontend is configured to use `http://localhost:8787`
3. CORS headers are set in `api/src/middleware/cors.js`

## Next Steps

1. **Install Dependencies**: Run `npm install` in both `api` and `frontend` directories
2. **Start Development**: Run both dev servers
3. **Test Locally**: Register an organization and create a test product
4. **Deploy**: Follow DEPLOYMENT.md when ready to go live

## Architecture Overview

### Data Flow

```
User Scans QR Code
    ↓
Frontend PWA (React)
    ↓
Cloudflare Workers API
    ↓
┌─────────────┬──────────────┬─────────────┐
│   D1 DB     │   R2 Storage │  KV Cache   │
│  (Products) │  (QR Codes)  │  (Sessions) │
└─────────────┴──────────────┴─────────────┘
```

### Cryptographic Verification

```
Product Registration
    ↓
Genesis Block Created
    ↓
Hash = SHA-256(timestamp + data + previousHash)
    ↓
Signature = ECDSA.sign(hash, privateKey)
    ↓
Stored in D1 (immutable)
    ↓
Each Stage Links to Previous
    ↓
Complete Chain Verifiable
```

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Contributing

This is a free and open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - Free for everyone to use and benefit from.
