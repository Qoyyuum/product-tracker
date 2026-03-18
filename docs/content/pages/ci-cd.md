Title: CI/CD Pipeline Documentation
Slug: ci-cd
Date: 2026-03-18
Modified: 2026-03-18
Category: Documentation
Tags: ci-cd, github-actions, automation
Authors: Product Tracker Team
Summary: Automated testing and deployment pipeline for the Product Tracker DApp using GitHub Actions.

# CI/CD Pipeline Documentation

This document explains the automated testing and deployment pipeline for the Product Tracker DApp.

## Overview

The project uses **GitHub Actions** for continuous integration and deployment to Cloudflare's edge network.

## Pipeline Workflow

The CI/CD pipeline consists of 5 jobs that run automatically:

```
┌─────────────┐     ┌──────────────┐
│  Test API   │     │ Test Frontend│
└──────┬──────┘     └──────┬───────┘
       │                   │
       └───────┬───────────┘
               ▼
       ┌───────────────┐
       │ Deploy API    │
       └───────┬───────┘
               │
       ┌───────▼───────┐
       │Deploy Frontend│
       └───────┬───────┘
               │
       ┌───────▼───────┐
       │Deploy Database│
       └───────────────┘
```

## Jobs Description

### 1. Test API
**Triggers:** Every push to `main`/`develop`, every PR to `main`

**Steps:**
- Checkout code
- Setup Node.js v20
- Install dependencies
- Run unit tests
- Generate coverage report

**Location:** `api/`

### 2. Test Frontend
**Triggers:** Every push to `main`/`develop`, every PR to `main`

**Steps:**
- Checkout code
- Setup Node.js v20
- Install dependencies
- Run unit tests
- Generate coverage report
- Build production bundle

**Location:** `frontend/`

### 3. Deploy API
**Triggers:** Only on push to `main` branch (after tests pass)

**Steps:**
- Checkout code
- Setup Node.js v20
- Install dependencies
- Deploy to Cloudflare Workers using Wrangler

**Deployment Target:** `https://api.product-tracker.programmerq.dev`

### 4. Deploy Frontend
**Triggers:** Only on push to `main` branch (after tests pass)

**Steps:**
- Checkout code
- Setup Node.js v20
- Install dependencies
- Build with production API URL
- Deploy to Cloudflare Pages

**Deployment Target:** `https://product-tracker.programmerq.dev`

### 5. Deploy Database
**Triggers:** Only on push to `main` branch (after API deployment)

**Steps:**
- Apply database schema to production D1 database
- Runs with `continue-on-error` to avoid failures if schema already exists

## Required GitHub Secrets

To enable automated deployment, configure these secrets in your GitHub repository:

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### CLOUDFLARE_API_TOKEN
- **Description:** Cloudflare API token with Workers and Pages permissions
- **How to get:**
  1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
  2. Click "Create Token"
  3. Use "Edit Cloudflare Workers" template
  4. Add permissions:
     - Account → Workers Scripts → Edit
     - Account → Cloudflare Pages → Edit
     - Account → D1 → Edit
  5. Copy the token

#### CLOUDFLARE_ACCOUNT_ID
- **Description:** Your Cloudflare account ID
- **How to get:**
  1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
  2. Select any domain
  3. Scroll down on the Overview page
  4. Copy "Account ID" from the right sidebar

## Workflow File

The workflow is defined in `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
```

## Branch Strategy

### Main Branch
- Protected branch
- Requires passing tests before merge
- Automatically deploys to production on push
- All deployments go through this branch

### Develop Branch
- Development branch
- Runs tests but does not deploy
- Used for feature integration

### Feature Branches
- Create from `develop`
- Open PR to `develop` or `main`
- Tests run on PR creation

## Deployment Process

### Automatic Deployment (Recommended)

1. **Develop features** in feature branches
2. **Create PR** to `main` branch
3. **Wait for tests** to pass (automatic)
4. **Merge PR** to `main`
5. **Automatic deployment** triggers:
   - API deploys to Cloudflare Workers
   - Frontend deploys to Cloudflare Pages
   - Database schema applies (if needed)

### Manual Deployment

If needed, you can still deploy manually:

```bash
# Deploy API
cd api
npm run deploy

# Deploy Frontend
cd frontend
npm run build
npx wrangler pages deploy dist

# Apply Database Schema
cd api
npx wrangler d1 execute product-tracker --file=../schema.sql --remote
```

## Monitoring Deployments

### GitHub Actions UI
1. Go to your repository on GitHub
2. Click **Actions** tab
3. View workflow runs and logs

### Cloudflare Dashboard
- **Workers:** [Cloudflare Workers Dashboard](https://dash.cloudflare.com/workers)
- **Pages:** [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
- **D1:** [Cloudflare D1 Dashboard](https://dash.cloudflare.com/d1)

## Troubleshooting

### Deployment Fails

**Check:**
1. GitHub secrets are correctly configured
2. Cloudflare API token has required permissions
3. Account ID is correct
4. Review error logs in GitHub Actions

### Tests Fail

**Common issues:**
1. Dependencies out of sync - run `npm ci`
2. Test environment issues - check Node.js version
3. Mock data doesn't match API responses

### Database Schema Errors

The database deployment job uses `continue-on-error: true` because:
- Schema may already exist in production
- Tables cannot be recreated without dropping first
- This is expected behavior

To update schema:
1. Manually drop and recreate tables in Cloudflare D1 dashboard
2. Re-run the workflow

## Best Practices

### Before Merging to Main

1. ✅ All tests pass locally
2. ✅ Code reviewed by team member
3. ✅ Feature tested in development environment
4. ✅ Documentation updated if needed

### After Deployment

1. ✅ Verify deployment in Cloudflare dashboard
2. ✅ Test production URLs
3. ✅ Check application logs for errors
4. ✅ Monitor performance metrics

## Rollback Strategy

If a deployment causes issues:

1. **Immediate:** Revert the commit and push to `main`
2. **Alternative:** Deploy previous working version manually
3. **Database:** Restore from D1 backup if available

## Future Enhancements

Consider adding:
- Staging environment deployment
- Performance testing in CI
- Security scanning (SAST/DAST)
- Automated E2E tests
- Slack/Discord notifications
- Deployment approval gates
