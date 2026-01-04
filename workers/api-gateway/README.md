# API Gateway Worker

## Overview

The API Gateway Worker provides a unified entry point for all API requests with built-in routing, CORS support, and error handling. This implementation is cloud-agnostic and can be deployed to multiple platforms.

## Features

- ✅ Centralized API routing
- ✅ CORS support (configurable)
- ✅ Health check endpoints
- ✅ Error handling and logging
- ✅ Cloud-agnostic implementation
- ✅ Multiple export formats (Cloudflare Workers, AWS Lambda, Azure Functions, etc.)

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/status` - Operational status
- `POST /api/chat` - Chat endpoint (MrketOz CRM integration)
- `GET /api/mrketoz` - MrketOz CRM status

## Deployment

### Cloudflare Workers

```bash
# Navigate to worker directory
cd workers/api-gateway

# Copy and configure wrangler.toml
cp wrangler.toml.template wrangler.toml
# Edit wrangler.toml with your account ID and routes

# Deploy
wrangler deploy
```

### AWS Lambda + API Gateway

```bash
# Package the worker
zip -r api-gateway.zip index.js

# Create Lambda function
aws lambda create-function \
  --function-name api-gateway \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://api-gateway.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role

# Create API Gateway and integrate with Lambda
aws apigateway create-rest-api --name api-gateway
```

### Azure Functions

```bash
# Create function app
az functionapp create \
  --name api-gateway \
  --resource-group YOUR_RESOURCE_GROUP \
  --consumption-plan-location eastus

# Deploy
func azure functionapp publish api-gateway
```

### Google Cloud Functions

```bash
# Deploy to Google Cloud Functions
gcloud functions deploy api-gateway \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point handleRequest \
  --allow-unauthenticated
```

### Other Platforms

See [WORKER_DEPLOYMENT.md](../../WORKER_DEPLOYMENT.md) for additional deployment options.

## Configuration

### Environment Variables

- `VERSION` - API version (default: 1.0.0)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (default: *)

### CORS Configuration

CORS is enabled by default with the following headers:

```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

To customize, modify the `corsHeaders` object in `index.js`.

## Testing

```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Test status endpoint
curl https://your-domain.com/api/status

# Test with CORS preflight
curl -X OPTIONS https://your-domain.com/api/health \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET"
```

## Extending the Gateway

### Adding New Routes

Edit the `routes` object in `index.js`:

```javascript
const routes = {
  '/api/health': handleHealth,
  '/api/status': handleStatus,
  '/api/your-endpoint': handleYourEndpoint  // Add new route
};

// Implement handler function
async function handleYourEndpoint(request, env) {
  return new Response(JSON.stringify({ message: 'Your response' }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
```

## Monitoring

The gateway provides built-in monitoring through:

- Health check endpoint (`/api/health`)
- Status endpoint (`/api/status`)
- Error logging to console
- Response headers with status information

## Support

For issues or questions, see the main repository documentation.
