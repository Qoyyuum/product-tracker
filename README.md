# QR-Based Product Tracker - Cloudflare DApp

A decentralized product tracking system using Cloudflare's edge infrastructure to verify product authenticity and quality control throughout the supply chain.

## Features

- **Cryptographic Verification**: Hash chains and digital signatures ensure data integrity
- **QR Code Scanning**: Instant product verification via mobile/desktop
- **Immutable Audit Trail**: Complete processing history with tamper-proof records
- **Global Performance**: <100ms response times via Cloudflare's edge network
- **Zero Cost**: Runs entirely on Cloudflare's free tier

## Architecture

- **Frontend**: React PWA (Cloudflare Pages)
- **API**: Cloudflare Workers (serverless)
- **Database**: D1 (SQLite at the edge)
- **Storage**: R2 (QR codes, images)
- **Cache**: KV Store

## Project Structure

```
product_tracker/
├── api/                    # Cloudflare Workers API
├── frontend/               # React PWA
├── schema.sql             # D1 database schema
└── README.md
```

## Getting Started

### Quick Start with Docker (Recommended)

```bash
# Start everything with one command
docker-compose up

# Access the app at:
# Frontend: http://localhost:3000
# API: http://localhost:8787
```

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

### Manual Setup

#### Prerequisites

- Node.js 18+
- Cloudflare account (free tier)
- Wrangler CLI

#### Installation

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Install dependencies
cd api && npm install
cd ../frontend && npm install
```

#### Development

```bash
# Terminal 1 - Start Workers API
cd api
npm run dev

# Terminal 2 - Start frontend dev server
cd frontend
npm run dev
```

### Deployment

```bash
# Deploy Workers API
cd api
wrangler deploy

# Deploy frontend to Pages
cd frontend
npm run build
wrangler pages deploy dist
```

## Documentation

See `/docs` for detailed documentation on:
- Architecture and design
- API endpoints
- Cryptographic implementation
- Deployment guide

## License

MIT License - Free for everyone to use and benefit from.
