# Worker Deployment Instructions

This document provides step-by-step instructions for deploying the edge workers based on the problem statement requirements.

## Overview

The repository contains two cloud-agnostic workers:
- **edge-cache**: Edge caching worker for performance optimization
- **api-gateway**: API gateway worker with routing and CORS support

## Deployment Plan

Based on the provided plan, here's what needs to be done:

### 1. Create (Deploy edge-cache Worker)

The edge-cache worker has been created and is ready for deployment.

**Steps to deploy:**

```bash
# Navigate to the edge-cache directory
cd workers/edge-cache

# Copy the Wrangler configuration template
cp wrangler.toml.template wrangler.toml

# Edit wrangler.toml with your account details
# - Replace account_id with your actual account ID
# - Configure routes for your domains
# - Adjust environment variables as needed

# Deploy using Wrangler CLI
wrangler deploy
```

**Alternative deployment methods:**

For other cloud providers, see the [WORKER_DEPLOYMENT.md](../WORKER_DEPLOYMENT.md) guide for AWS Lambda@Edge, Azure Functions, or Google Cloud Functions deployment instructions.

### 2. Update (Redeploy api-gateway Worker)

The api-gateway worker has been created/updated and is ready for deployment.

**Steps to deploy:**

```bash
# Navigate to the api-gateway directory
cd workers/api-gateway

# Copy the Wrangler configuration template (if not already done)
cp wrangler.toml.template wrangler.toml

# Edit wrangler.toml with your account details
# - Replace account_id with your actual account ID
# - Configure routes for your domains
# - Adjust environment variables as needed

# Deploy using Wrangler CLI
wrangler deploy
```

**Alternative deployment methods:**

For other cloud providers, see the [WORKER_DEPLOYMENT.md](../WORKER_DEPLOYMENT.md) guide for AWS Lambda, Azure Functions, or Google Cloud Functions deployment instructions.

### 3. Skip Orphans

No orphaned workers are listed in the plan, so no action is required for this category.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Installed Wrangler CLI (for provider-specific deployments)
- [ ] Configured your cloud provider credentials
- [ ] Created wrangler.toml files from templates
- [ ] Updated account IDs and routes in configuration
- [ ] Reviewed and customized environment variables
- [ ] Tested workers locally (if possible)
- [ ] Verified domain configuration

## Verification

After deployment, verify that the workers are functioning correctly:

### Edge Cache Worker

```bash
# Test cache miss (first request)
curl -I https://your-domain.com/test-page

# Test cache hit (second request)
curl -I https://your-domain.com/test-page

# Verify X-Cache-Status header is present
```

### API Gateway Worker

```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Expected response:
# {"status":"healthy","service":"API Gateway","timestamp":"...","version":"1.0.0"}

# Test status endpoint
curl https://your-domain.com/api/status

# Expected response:
# {"status":"operational","uptime":"...","endpoints":[...],"timestamp":"..."}
```

## Deployment Scripts

For convenience, use the provided deployment script:

```bash
# Deploy edge-cache worker only
./workers/deploy-cloudflare.sh edge-cache

# Deploy api-gateway worker only
./workers/deploy-cloudflare.sh api-gateway

# Deploy both workers
./workers/deploy-cloudflare.sh all
```

**Note:** The script assumes provider-specific CLI tools are installed and configured.

## Rollback Plan

If deployment causes issues:

1. Check worker logs for errors
2. Verify configuration files are correct
3. Use cloud provider's rollback features if available
4. Revert to previous version if needed

See [WORKER_DEPLOYMENT.md](../WORKER_DEPLOYMENT.md) for platform-specific rollback instructions.

## Monitoring

After deployment, monitor:

- Request counts and response times
- Error rates and types
- Cache hit/miss ratios (edge-cache)
- API endpoint usage (api-gateway)

## Support

For deployment issues:

1. Check worker-specific README files in each worker directory
2. Review [WORKER_DEPLOYMENT.md](../WORKER_DEPLOYMENT.md)
3. Consult your cloud provider's documentation
4. Check repository issues for similar problems

## Cloud-Agnostic Note

This repository maintains strict cloud-agnostic principles. While the instructions above reference specific tools (like Wrangler for certain providers), the worker code itself is platform-independent and can be deployed to:

- Edge computing platforms (various providers)
- AWS Lambda / Lambda@Edge
- Azure Functions
- Google Cloud Functions
- Other serverless platforms

Choose the deployment method that best fits your infrastructure.
