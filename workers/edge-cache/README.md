# Edge Cache Worker

## Overview

The Edge Cache Worker provides intelligent caching at the edge to improve performance and reduce origin server load. This implementation is cloud-agnostic and can be deployed to multiple platforms.

## Features

- ✅ Automatic cache management
- ✅ Cache hit/miss headers (`X-Cache-Status`)
- ✅ Cache age tracking (`X-Cache-Age`)
- ✅ Respects `Cache-Control` headers
- ✅ Cloud-agnostic implementation

## Deployment

### Cloudflare Workers

```bash
# Navigate to worker directory
cd workers/edge-cache

# Copy and configure wrangler.toml
cp wrangler.toml.template wrangler.toml
# Edit wrangler.toml with your account ID and routes

# Deploy
wrangler deploy
```

### AWS Lambda@Edge

```bash
# Package the worker
zip -r edge-cache.zip index.js

# Create Lambda function
aws lambda create-function \
  --function-name edge-cache \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://edge-cache.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-edge-role

# Associate with CloudFront distribution
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://cloudfront-config.json
```

### Azure Functions

```bash
# Create function app
az functionapp create \
  --name edge-cache \
  --resource-group YOUR_RESOURCE_GROUP \
  --consumption-plan-location eastus

# Deploy
func azure functionapp publish edge-cache
```

### Other Platforms

See [WORKER_DEPLOYMENT.md](../../WORKER_DEPLOYMENT.md) for additional deployment options.

## Configuration

The worker uses the Cache API when available and falls back gracefully when not supported.

### Environment Variables

- `VERSION` - Worker version (optional)
- `CACHE_TTL` - Default cache TTL in seconds (default: 3600)

## Testing

```bash
# Test cache miss
curl -I https://your-domain.com/path

# Test cache hit (second request)
curl -I https://your-domain.com/path

# Check cache status
curl -I https://your-domain.com/path | grep X-Cache-Status
```

## Monitoring

Monitor cache performance using the following headers:

- `X-Cache-Status`: HIT or MISS
- `X-Cache-Age`: Age of cached content in seconds
- `Cache-Control`: Cache directives from origin

## Support

For issues or questions, see the main repository documentation.
