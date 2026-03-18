Title: Docker Setup Guide
Slug: docker
Date: 2026-03-18
Modified: 2026-03-18
Category: Documentation
Tags: docker, development, containers
Authors: Product Tracker Team
Summary: Run the entire Product Tracker application with a single command using Docker Compose.

# Docker Setup Guide

Run the entire Product Tracker application with a single command using Docker Compose.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start Everything

```bash
docker-compose up
```

This will:
- Build both API and frontend containers
- Start the API on http://localhost:8787
- Start the frontend on http://localhost:3000
- Set up networking between containers
- Enable hot-reload for development

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8787
- **Health Check**: http://localhost:8787/v1/health

### 3. Stop Everything

```bash
# Stop containers (Ctrl+C in the terminal)
# Or in detached mode:
docker-compose down
```

## Docker Commands

### Run in Background (Detached Mode)

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# Frontend only
docker-compose logs -f frontend
```

### Rebuild Containers

```bash
# Rebuild after dependency changes
docker-compose up --build

# Force rebuild
docker-compose build --no-cache
```

### Stop and Remove Everything

```bash
docker-compose down -v
```

### Run Commands Inside Containers

```bash
# API container
docker-compose exec api npm install <package>
docker-compose exec api sh

# Frontend container
docker-compose exec frontend npm install <package>
docker-compose exec frontend sh
```

## Development Workflow

### Hot Reload

Both containers are configured with volume mounts, so changes to your code will automatically reload:

- **API**: Wrangler dev server auto-reloads on file changes
- **Frontend**: Vite dev server auto-reloads on file changes

### Installing New Dependencies

**Option 1: Inside Container**
```bash
docker-compose exec api npm install <package>
docker-compose exec frontend npm install <package>
```

**Option 2: Rebuild**
```bash
# Install locally first
cd api && npm install <package>
cd ../frontend && npm install <package>

# Then rebuild containers
docker-compose up --build
```

## Environment Variables

Edit `docker-compose.yml` to change environment variables:

```yaml
services:
  api:
    environment:
      - JWT_SECRET=your-secret-here
      - ADMIN_API_KEY=your-key-here
  
  frontend:
    environment:
      - VITE_API_URL=http://localhost:8787
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
# Windows
netstat -ano | findstr :8787
netstat -ano | findstr :3000

# Kill the process or change ports in docker-compose.yml
```

### Containers Won't Start

```bash
# View detailed logs
docker-compose logs

# Remove all containers and rebuild
docker-compose down -v
docker-compose up --build
```

### Changes Not Reflecting

```bash
# Rebuild containers
docker-compose up --build

# Or force rebuild
docker-compose build --no-cache
docker-compose up
```

### Permission Issues (Linux/Mac)

```bash
# Fix node_modules permissions
docker-compose exec api chown -R node:node /app/node_modules
docker-compose exec frontend chown -R node:node /app/node_modules
```

## Production Build

For production deployment, use the standard Cloudflare deployment process (see DEPLOYMENT.md). Docker is primarily for local development.

However, you can build production-ready images:

```bash
# Build production frontend
docker-compose exec frontend npm run build

# The dist folder will be in frontend/dist
```

## Docker Compose Configuration

The `docker-compose.yml` file defines:

- **api**: Cloudflare Workers development server
- **frontend**: Vite development server
- **networks**: Bridge network for container communication
- **volumes**: Code mounted for hot-reload

## Benefits of Docker Setup

✅ **One Command**: Start everything with `docker-compose up`  
✅ **Consistent Environment**: Same setup across all machines  
✅ **Isolated Dependencies**: No conflicts with system Node.js  
✅ **Easy Cleanup**: Remove everything with `docker-compose down -v`  
✅ **Hot Reload**: Changes reflect immediately  
✅ **Network Isolation**: Containers communicate securely  

## Alternative: Without Docker

If you prefer not to use Docker:

```bash
# Terminal 1 - API
cd api
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

See GETTING_STARTED.md for detailed non-Docker setup.
