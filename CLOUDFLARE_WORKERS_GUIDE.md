# Cloudflare Workers Deployment Guide

## Overview

This repository includes two Cloudflare Workers designed to enhance customer operations and visual content generation:

- **MrketOz Worker** (`/chat`) - Customer operations bot
- **SeveNue Worker** (`/cta`) - CTA visuals and content templates generator

## Worker Architecture

### MrketOz Worker
- **File**: `workers/mrketoz-worker.js`
- **Endpoint**: `/chat`
- **Purpose**: Customer operations automation
- **Features**:
  - Quote request handling
  - Project tracking
  - Support ticket creation
  - Consultation scheduling

### SeveNue Worker
- **File**: `workers/sevenue-worker.js`
- **Endpoint**: `/cta`
- **Purpose**: Visual content and CTA generation
- **Features**:
  - Dynamic CTA template generation
  - Multi-variant testing support
  - Responsive design optimization
  - Performance-optimized templates

## Prerequisites

### Account Setup
1. **Cloudflare Account**: Active Cloudflare account with Workers plan
2. **Domain Configuration**: Both `fitoutlab.app` and `designfitout.com` managed in Cloudflare
3. **Access Control**: Restrict access to authorized accounts:
   - Primary: `support@designfitout.com`
   - Technical Lead: `this4arun@gmail.com`
4. **Security**: 2FA enabled on all accounts

### Development Tools
```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Verify authentication
wrangler whoami
```

## Deployment Instructions

### 1. Configure Workers

Create `wrangler.toml` files for each worker:

#### MrketOz Worker Configuration
```toml
# workers/mrketoz/wrangler.toml
name = "mrketoz-customer-ops"
main = "mrketoz-worker.js"
compatibility_date = "2024-12-01"

[env.production]
name = "mrketoz-customer-ops"
routes = [
  { pattern = "fitoutlab.app/chat", zone_name = "fitoutlab.app" },
  { pattern = "designfitout.com/chat", zone_name = "designfitout.com" }
]

[env.staging]
name = "mrketoz-customer-ops-staging"
routes = [
  { pattern = "staging.fitoutlab.app/chat", zone_name = "fitoutlab.app" },
  { pattern = "staging.designfitout.com/chat", zone_name = "designfitout.com" }
]

[[env.production.vars]]
ENVIRONMENT = "production"
SERVICE_NAME = "MrketOz Customer Operations"

[[env.staging.vars]]
ENVIRONMENT = "staging"
SERVICE_NAME = "MrketOz Customer Operations (Staging)"
```

#### SeveNue Worker Configuration
```toml
# workers/sevenue/wrangler.toml
name = "sevenue-cta-generator"
main = "sevenue-worker.js"
compatibility_date = "2024-12-01"

[env.production]
name = "sevenue-cta-generator"
routes = [
  { pattern = "fitoutlab.app/cta", zone_name = "fitoutlab.app" },
  { pattern = "designfitout.com/cta", zone_name = "designfitout.com" }
]

[env.staging]
name = "sevenue-cta-generator-staging"
routes = [
  { pattern = "staging.fitoutlab.app/cta", zone_name = "fitoutlab.app" },
  { pattern = "staging.designfitout.com/cta", zone_name = "designfitout.com" }
]

[[env.production.vars]]
ENVIRONMENT = "production"
SERVICE_NAME = "SeveNue CTA Generator"
TEMPLATE_VERSION = "1.0.0"

[[env.staging.vars]]
ENVIRONMENT = "staging"
SERVICE_NAME = "SeveNue CTA Generator (Staging)"
TEMPLATE_VERSION = "1.0.0-staging"
```

### 2. Deploy Workers

#### Setup Directory Structure
```bash
# Create worker-specific directories
mkdir -p workers/mrketoz workers/sevenue

# Move worker files
mv workers/mrketoz-worker.js workers/mrketoz/
mv workers/sevenue-worker.js workers/sevenue/

# Create wrangler.toml files (content above)
```

#### Deploy to Staging
```bash
# Deploy MrketOz Worker to staging
cd workers/mrketoz
wrangler deploy --env staging

# Deploy SeveNue Worker to staging
cd ../sevenue
wrangler deploy --env staging
```

#### Test Staging Deployments
```bash
# Test MrketOz Worker
curl -X GET "https://staging.fitoutlab.app/chat"
curl -X POST "https://staging.fitoutlab.app/chat" \
  -H "Content-Type: application/json" \
  -d '{"action": "quote", "payload": {"project_type": "office", "space_size": "1000 sqft", "location": "Dubai"}}'

# Test SeveNue Worker  
curl -X GET "https://staging.designfitout.com/cta"
curl -X POST "https://staging.designfitout.com/cta" \
  -H "Content-Type: application/json" \
  -d '{"template_type": "hero", "variant": "gradient", "context": {"text": "Get Quote Now"}}'
```

#### Deploy to Production
```bash
# Deploy MrketOz Worker to production
cd workers/mrketoz
wrangler deploy --env production

# Deploy SeveNue Worker to production
cd ../sevenue
wrangler deploy --env production
```

## Configuration Management

### Environment Variables

#### MrketOz Worker Variables
- `ENVIRONMENT`: Deployment environment (staging/production)
- `SERVICE_NAME`: Human-readable service name
- `EMAIL_SERVICE_API`: Email service integration endpoint
- `CRM_INTEGRATION_URL`: CRM system webhook URL
- `SUPPORT_TICKET_API`: Support system API endpoint

#### SeveNue Worker Variables
- `ENVIRONMENT`: Deployment environment
- `SERVICE_NAME`: Human-readable service name
- `TEMPLATE_VERSION`: Template engine version
- `CDN_BASE_URL`: CDN URL for static assets
- `ANALYTICS_ENDPOINT`: Analytics tracking endpoint

### Secrets Management
```bash
# Add secrets to workers
wrangler secret put EMAIL_API_KEY --env production
wrangler secret put CRM_API_TOKEN --env production
wrangler secret put ANALYTICS_TOKEN --env production

# List secrets
wrangler secret list --env production
```

## Testing and Validation

### Automated Testing

Create test suite for each worker:

```bash
# workers/tests/mrketoz.test.js
import { describe, it, expect } from 'vitest';

describe('MrketOz Worker', () => {
  it('should return chat options on GET /chat', async () => {
    const response = await fetch('https://staging.fitoutlab.app/chat');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.service).toBe('MrketOz Customer Operations Bot');
    expect(data.options).toHaveLength(4);
  });

  it('should handle quote requests', async () => {
    const response = await fetch('https://staging.fitoutlab.app/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'quote',
        payload: {
          project_type: 'office',
          space_size: '1000 sqft',
          location: 'Dubai'
        }
      })
    });
    
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.quote_id).toMatch(/^QUO-/);
  });
});
```

### Performance Testing
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://fitoutlab.app/chat
ab -n 1000 -c 10 https://designfitout.com/cta

# Performance monitoring
wrangler tail --env production
```

### Health Checks
```bash
# Create health check script
#!/bin/bash
# health-check.sh

# Check MrketOz Worker
echo "Testing MrketOz Worker..."
curl -f -s https://fitoutlab.app/chat > /dev/null && echo "✅ MrketOz OK" || echo "❌ MrketOz FAIL"

# Check SeveNue Worker
echo "Testing SeveNue Worker..."
curl -f -s https://designfitout.com/cta > /dev/null && echo "✅ SeveNue OK" || echo "❌ SeveNue FAIL"
```

## Monitoring and Analytics

### Metrics Collection
- **Request Volume**: Requests per second/minute
- **Response Time**: Average and P95 latencies
- **Error Rates**: 4xx and 5xx error percentages
- **Geographic Distribution**: Requests by region

### Logging Configuration
```javascript
// Add to worker files
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  worker: 'mrketoz',
  method: request.method,
  url: request.url,
  cf: request.cf,
  response_time: Date.now() - startTime
}));
```

### Alerting Setup
- **Error Rate > 5%**: Immediate alert
- **Response Time > 1000ms**: Warning alert  
- **Request Volume Drop > 50%**: Monitoring alert
- **Worker Deployment**: Notification alert

## Security Considerations

### Access Control
- **API Rate Limiting**: 100 requests/minute per IP
- **CORS Configuration**: Restrict to allowed origins
- **Input Validation**: Sanitize all user inputs
- **Secret Management**: Use Wrangler secrets for sensitive data

### Content Security Policy
```javascript
// Add CSP headers to responses
const cspHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff'
};
```

### Data Privacy
- **PII Handling**: Minimize collection, encrypt storage
- **GDPR Compliance**: Include data processing notices
- **Audit Logging**: Track all data access and modifications

## Troubleshooting

### Common Issues

#### Deployment Failures
```bash
# Check wrangler.toml syntax
wrangler dev --local

# Validate worker script
wrangler validate

# Check deployment status
wrangler deployments list
```

#### Performance Issues
- Monitor CPU time limits (10ms per request)
- Check memory usage (128MB limit)  
- Optimize JSON parsing and response generation
- Use efficient algorithms for template generation

#### CORS Errors
- Verify Access-Control-Allow-Origin headers
- Check preflight OPTIONS handling
- Validate allowed methods and headers

### Support Contacts
- **Technical Issues**: `this4arun@gmail.com`
- **Cloudflare Support**: Enterprise support portal
- **Emergency**: Use Cloudflare dashboard to disable workers

## Maintenance Schedule

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check error logs
- [ ] Validate health checks
- [ ] Monitor usage quotas

### Monthly Tasks
- [ ] Update worker dependencies
- [ ] Review and rotate secrets
- [ ] Performance optimization review
- [ ] Security audit

### Quarterly Tasks
- [ ] Template library updates
- [ ] Feature enhancement planning
- [ ] Disaster recovery testing
- [ ] Documentation updates

---

*Last Updated: December 2024*
*Document Version: 1.0*