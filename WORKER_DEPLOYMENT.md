# Worker Deployment Guide

This guide explains how to deploy the edge workers in this repository to various cloud platforms. The workers are implemented in a cloud-agnostic way to support multiple deployment targets.

## Available Workers

- **edge-cache**: Edge caching worker for improved performance
- **api-gateway**: Unified API gateway with routing and CORS support

## Quick Start

### Cloudflare Workers (Recommended for Edge Computing)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Deploy edge-cache worker
cd workers/edge-cache
cp wrangler.toml.template wrangler.toml
# Edit wrangler.toml with your account ID
wrangler deploy

# Deploy api-gateway worker
cd ../api-gateway
cp wrangler.toml.template wrangler.toml
# Edit wrangler.toml with your account ID
wrangler deploy
```

### AWS Lambda + API Gateway

```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Deploy edge-cache to Lambda@Edge
cd workers/edge-cache
zip -r edge-cache.zip index.js
aws lambda create-function \
  --function-name edge-cache \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://edge-cache.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-edge-role

# Deploy api-gateway to Lambda
cd ../api-gateway
zip -r api-gateway.zip index.js
aws lambda create-function \
  --function-name api-gateway \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://api-gateway.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role

# Create API Gateway
aws apigateway create-rest-api --name api-gateway
```

### Azure Functions

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Login to Azure
az login

# Create resource group
az group create --name workers-rg --location eastus

# Deploy edge-cache
cd workers/edge-cache
func init --worker-runtime node
func azure functionapp create \
  --resource-group workers-rg \
  --consumption-plan-location eastus \
  --name edge-cache
func azure functionapp publish edge-cache

# Deploy api-gateway
cd ../api-gateway
func init --worker-runtime node
func azure functionapp create \
  --resource-group workers-rg \
  --consumption-plan-location eastus \
  --name api-gateway
func azure functionapp publish api-gateway
```

### Google Cloud Functions

```bash
# Install gcloud CLI
# See: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Deploy edge-cache
cd workers/edge-cache
gcloud functions deploy edge-cache \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point handleRequest \
  --allow-unauthenticated

# Deploy api-gateway
cd ../api-gateway
gcloud functions deploy api-gateway \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point handleRequest \
  --allow-unauthenticated
```

## Deployment Strategies

### 1. Create New Workers

When creating new workers for the first time:

1. Choose your cloud platform
2. Follow the Quick Start guide above
3. Configure environment variables
4. Test the deployment
5. Monitor performance

### 2. Update Existing Workers

When updating workers that are already deployed:

1. Make changes to worker code
2. Test locally if possible
3. Run deployment command again
4. Verify the update was successful
5. Monitor for errors

### 3. Skip Orphaned Workers

If you have workers deployed that are no longer needed:

1. Identify orphaned workers
2. Back up any necessary data
3. Delete the worker from your cloud platform
4. Remove related configuration files
5. Update documentation

## Configuration

### Environment Variables

Set these environment variables for your deployments:

```bash
# Worker configuration
VERSION=1.0.0
CACHE_TTL=3600
ALLOWED_ORIGINS=https://fitoutlab.app,https://designfitout.com

# Cloud provider specific
ACCOUNT_ID=your-account-id
REGION=us-east-1
RESOURCE_GROUP=your-resource-group
```

### Domain Configuration

Configure your workers to handle requests for your domains:

- Primary: `fitoutlab.app`
- Secondary: `designfitout.com`

Update the routes in `wrangler.toml.template` or your cloud provider's configuration.

## Testing

### Local Testing

```bash
# Test with Node.js
cd workers/edge-cache
node -e "const w = require('./index.js'); console.log(w);"

# Test with Wrangler (Cloudflare)
wrangler dev
```

### Production Testing

```bash
# Test edge-cache
curl -I https://your-domain.com/

# Test api-gateway health
curl https://your-domain.com/api/health

# Test api-gateway status
curl https://your-domain.com/api/status
```

## Monitoring

Monitor your workers using:

- Cloud provider dashboards
- Custom logging
- Performance metrics
- Error tracking

### Key Metrics to Monitor

- Request count
- Response times
- Error rates
- Cache hit rates (edge-cache)
- API endpoint usage (api-gateway)

## Troubleshooting

### Common Issues

**Problem**: Worker fails to deploy
- **Solution**: Check your account credentials and permissions

**Problem**: Worker returns 404 errors
- **Solution**: Verify route configuration matches your domain setup

**Problem**: CORS errors in api-gateway
- **Solution**: Update `corsHeaders` in `index.js` to match your allowed origins

**Problem**: Cache not working in edge-cache
- **Solution**: Verify your platform supports the Cache API or implement custom caching

## Rollback

If a deployment causes issues:

### Cloudflare Workers

```bash
# Rollback to previous version
wrangler rollback
```

### AWS Lambda

```bash
# List versions
aws lambda list-versions-by-function --function-name worker-name

# Update alias to point to previous version
aws lambda update-alias \
  --function-name worker-name \
  --name production \
  --function-version PREVIOUS_VERSION
```

### Azure Functions

```bash
# List deployment slots
az functionapp deployment slot list \
  --name worker-name \
  --resource-group your-rg

# Swap slots
az functionapp deployment slot swap \
  --name worker-name \
  --resource-group your-rg \
  --slot staging
```

## Security Best Practices

1. ✅ Use environment variables for sensitive data
2. ✅ Implement rate limiting
3. ✅ Enable authentication where appropriate
4. ✅ Keep dependencies updated
5. ✅ Monitor for security vulnerabilities
6. ✅ Use HTTPS only
7. ✅ Implement proper CORS policies

## Performance Optimization

1. ✅ Enable caching where appropriate
2. ✅ Minimize cold starts
3. ✅ Use connection pooling
4. ✅ Implement request batching
5. ✅ Monitor and optimize response times

## Cost Optimization

- Monitor usage and costs
- Set up billing alerts
- Use caching to reduce origin requests
- Optimize worker code for efficiency
- Choose the right pricing tier

## Support

For deployment issues or questions:

1. Check worker-specific README files
2. Review cloud provider documentation
3. Search repository issues
4. Open a new issue with details

## Migration Between Platforms

To migrate workers from one platform to another:

1. Deploy to new platform following Quick Start
2. Test thoroughly on new platform
3. Update DNS/routing to new platform
4. Monitor for issues
5. Decommission old platform after validation

## Cloud-Agnostic Architecture

This repository maintains strict cloud-agnostic principles:

- ✅ Workers export multiple formats
- ✅ No hard-coded cloud provider references in main code
- ✅ Configuration-driven deployment
- ✅ Template-based setup files
- ✅ Multi-platform compatibility

The Wrangler configuration files and cloud-specific commands are provided as templates and examples, but the core worker code remains platform-independent.
