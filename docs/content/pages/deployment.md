Title: Deployment Guide
Slug: deployment
Date: 2026-03-18
Modified: 2026-03-18
Category: Documentation
Tags: deployment, cloudflare, production
Authors: Product Tracker Team
Summary: Complete guide to deploying the QR-based product tracker on Cloudflare's infrastructure.

# Deployment Guide - Product Tracker DApp

Complete guide to deploying the QR-based product tracker on Cloudflare's infrastructure.

## Prerequisites

- Node.js 24+ installed
- Cloudflare account (free tier)
- Git installed
- Basic command line knowledge

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## Step 2: Set Up D1 Database

```bash
# Navigate to API directory
cd api

# Create D1 database
wrangler d1 create product-tracker-db

# Copy the database_id from output and update wrangler.toml
# Replace YOUR_DATABASE_ID in api/wrangler.toml with the actual ID

# Run database migrations
wrangler d1 execute product-tracker-db --file=../schema.sql --remote
```

## Step 3: Set Up R2 Storage

```bash
# Create R2 bucket for QR codes and images
wrangler r2 bucket create product-tracker-storage

# Bucket is automatically bound in wrangler.toml
```

## Step 4: Set Up KV Namespace

```bash
# Create KV namespace for caching
wrangler kv:namespace create "CACHE"

# Copy the namespace ID from output and update wrangler.toml
# Replace YOUR_KV_ID in api/wrangler.toml
```

## Step 5: Set Environment Secrets

```bash
# Set JWT secret for authentication
wrangler secret put JWT_SECRET
# Enter a strong random string when prompted

# Set admin API key (optional)
wrangler secret put ADMIN_API_KEY
# Enter a secure API key when prompted
```

## Step 6: Deploy Workers API

```bash
# Install dependencies
cd api
npm install

# Deploy to Cloudflare
wrangler deploy

# Note the deployed URL (e.g., https://product-tracker-api.your-subdomain.workers.dev)
```

## Step 7: Deploy Frontend to Pages

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file with API URL
echo "VITE_API_URL=https://product-tracker-api.your-subdomain.workers.dev" > .env

# Build the frontend
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=product-tracker

# Or connect GitHub for automatic deployments
wrangler pages project create product-tracker
```

## Step 8: Configure Custom Domain (Optional)

### For Workers API
```bash
# Add custom domain in Cloudflare dashboard
# Workers & Pages > product-tracker-api > Settings > Domains & Routes
# Add: api.yourdomain.com
```

### For Pages Frontend
```bash
# Add custom domain in Cloudflare dashboard
# Workers & Pages > product-tracker > Custom domains
# Add: yourdomain.com or app.yourdomain.com
```

## Step 9: Update Environment Variables

After deploying, update the frontend environment variable:

```bash
# In Cloudflare Dashboard:
# Pages > product-tracker > Settings > Environment variables
# Add: VITE_API_URL = https://api.yourdomain.com (or your Workers URL)

# Redeploy frontend
cd frontend
npm run build
wrangler pages deploy dist --project-name=product-tracker
```

## Verification Checklist

- [ ] D1 database created and schema applied
- [ ] R2 bucket created
- [ ] KV namespace created
- [ ] Secrets configured (JWT_SECRET)
- [ ] Workers API deployed and accessible
- [ ] Frontend deployed to Pages
- [ ] Environment variables set correctly
- [ ] Health check endpoint working: `curl https://your-api-url/v1/health`

## Testing the Deployment

### 1. Test Health Endpoint
```bash
curl https://your-api-url/v1/health
# Should return: {"status":"healthy","timestamp":...}
```

### 2. Test Registration
```bash
curl -X POST https://your-api-url/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "organizationName": "Test Manufacturer",
    "organizationType": "manufacturer"
  }'
```

### 3. Access Frontend
Visit your Pages URL and verify:
- Home page loads
- Navigation works
- QR scanner requests camera permission

## Monitoring

### View Logs
```bash
# Workers logs
wrangler tail

# Pages deployment logs
# View in Cloudflare Dashboard > Pages > Deployments
```

### Analytics
- Workers Analytics: Dashboard > Workers & Pages > product-tracker-api > Analytics
- Pages Analytics: Dashboard > Workers & Pages > product-tracker > Analytics

## Troubleshooting

### Database Connection Issues
```bash
# Verify D1 database exists
wrangler d1 list

# Test database connection
wrangler d1 execute product-tracker-db --command="SELECT 1"
```

### CORS Errors
- Ensure CORS headers are properly set in `api/src/middleware/cors.js`
- Check that API URL in frontend matches deployed Workers URL

### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

### Secret Not Found
```bash
# List secrets
wrangler secret list

# Re-add secret if missing
wrangler secret put JWT_SECRET
```

## Cost Monitoring

### Free Tier Limits
- **Workers**: 100,000 requests/day
- **D1**: 5GB storage, 5M reads/day, 100k writes/day
- **R2**: 10GB storage, 1M writes/month
- **KV**: 100k reads/day, 1k writes/day
- **Pages**: Unlimited bandwidth

### Usage Tracking
Monitor usage in Cloudflare Dashboard:
- Workers & Pages > Overview > Usage
- Set up billing alerts if approaching limits

## Scaling Beyond Free Tier

When you exceed free tier limits:

### Workers Paid ($5/month)
- 10M requests/month
- No CPU time limits
- Better for production

### D1 Paid (Usage-based)
- $0.001 per 1k reads (after 5M/day)
- $0.001 per 1k writes (after 100k/day)

### R2 Paid (Usage-based)
- $0.015 per GB storage (after 10GB)
- Zero egress fees

## Backup Strategy

### Database Backups
```bash
# Export D1 database
wrangler d1 export product-tracker-db --output=backup.sql

# Schedule regular backups (add to cron)
# 0 0 * * * cd /path/to/project && wrangler d1 export product-tracker-db --output=backup-$(date +\%Y\%m\%d).sql
```

### Configuration Backups
- All configuration is in Git repository
- Secrets should be stored securely (password manager)
- Document any manual Cloudflare dashboard changes

## Security Best Practices

1. **Rotate Secrets Regularly**
   ```bash
   wrangler secret put JWT_SECRET
   ```

2. **Enable Rate Limiting**
   - Implemented in `api/src/middleware/auth.js`
   - Monitor for abuse in analytics

3. **Review Access Logs**
   - Check Workers analytics for suspicious patterns
   - Monitor failed authentication attempts

4. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

## Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy Workers
        working-directory: ./api
        run: |
          npm install
          npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy Pages
        working-directory: ./frontend
        run: |
          npm install
          npm run build
          npx wrangler pages deploy dist --project-name=product-tracker
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Support

For issues or questions:
1. Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
2. Review project README.md
3. Check GitHub issues
4. Cloudflare Community: https://community.cloudflare.com/

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Invite beta users to test
3. Monitor analytics and logs
4. Gather feedback for improvements
5. Plan feature enhancements

---

**Deployment Complete!** 🎉

Your product tracker DApp is now live on Cloudflare's global edge network.
