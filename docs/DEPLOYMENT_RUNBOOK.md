# Deployment Runbook

This runbook provides detailed steps for deploying and verifying the Designfitout-Github repository after Cloudflare migration.

## 🎯 Overview

This runbook covers:
- Pre-deployment validation
- Cloudflare deployment process
- Post-deployment verification
- Rollback procedures
- Troubleshooting common issues

## 🔧 Pre-deployment Checklist

### 1. Local Validation
```bash
# Run all validation tests
npm run test:all

# Specific validations
node test-brand-neutrality.js
node test-mrketoz-crm.js

# Check for banned terms
grep -r "firebase\|cloudflare\|ga4\|gsc" public/ README.md deploy roots --exclude-dir=.git --exclude="*.md" --exclude="*config*" || echo "✅ No banned terms found"
```

### 2. Configuration Validation
```bash
# Verify configuration template exists
test -f config.template.json && echo "✅ Config template found" || echo "❌ Config template missing"

# Ensure config.json is not committed
test ! -f config.json && echo "✅ Local config not committed" || echo "⚠️ Local config.json should not be committed"

# Validate JSON structure
node -e "console.log('✅ Config template valid:', JSON.parse(require('fs').readFileSync('config.template.json', 'utf8')))"
```

### 3. Playwright Test Validation
```bash
# Install dependencies and browsers
npm ci
npx playwright install

# Run smoke tests locally
npm run dev &
SERVER_PID=$!
sleep 5
npx playwright test tests/health.spec.ts tests/redirects.spec.ts
kill $SERVER_PID
```

## 🚀 Cloudflare Deployment Process

### Step 1: Prepare Environment
```bash
# Ensure you're in the project directory
cd /path/to/Designfitout-Github

# Verify git status
git status
git pull origin main
```

### Step 2: Deploy to Cloudflare Pages
```bash
# If using Cloudflare CLI (wrangler)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy pages
wrangler pages deploy public --project-name designfitout-github
```

### Step 3: Deploy Functions to Cloudflare Workers
```bash
# Deploy serverless functions
wrangler deploy --config functions/wrangler.toml

# Verify deployment
wrangler tail
```

### Step 4: Configure Custom Domains
```bash
# Set up custom domains for dual domain support
wrangler pages domain add designfitout.com
wrangler pages domain add fitoutlab.app
wrangler pages domain add www.designfitout.com
wrangler pages domain add www.fitoutlab.app
```

## ✅ Post-deployment Verification

### 1. Automated Health Checks
```bash
# Run the deep verification script
./scripts/deep_clean_verify.sh

# Expected output: All checks should pass
```

### 2. Manual Verification Steps

#### Domain Resolution
```bash
# Test primary domains
curl -I https://designfitout.com
curl -I https://fitoutlab.app
curl -I https://www.designfitout.com
curl -I https://www.fitoutlab.app

# All should return 200 OK
```

#### Core Pages
```bash
# Test main pages
curl -f https://designfitout.com/ 
curl -f https://designfitout.com/ind2x.html

# Test API endpoints
curl -f https://designfitout.com/health
curl -f https://designfitout.com/api/status
```

#### Performance Validation
```bash
# Test response times (should be < 2 seconds)
time curl -s https://designfitout.com/ > /dev/null
time curl -s https://fitoutlab.app/ > /dev/null
```

### 3. Functional Testing

#### MrketOz CRM Chat Functionality
```bash
# Test chat endpoint
curl -X POST https://designfitout.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "action": "general"}'

# Should return JSON with reply, options, timestamp
```

#### Authentication Endpoints
```bash
# Test auth health
curl https://designfitout.com/api/auth/health

# Should return health status
```

### 4. Cross-Browser Testing
- Test in Chrome, Firefox, Safari
- Verify mobile responsiveness
- Check video integration functionality
- Validate form submissions (if any)

### 5. Security Verification
```bash
# Check security headers
curl -I https://designfitout.com/ | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)"

# Verify HTTPS enforcement
curl -I http://designfitout.com/ | grep -i location
```

## 🔄 Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous deployment
wrangler pages deployment list --project-name designfitout-github
wrangler pages deployment rollback <deployment-id>
```

### Emergency Rollback
```bash
# If deployment is completely broken, redeploy known good version
git checkout <last-known-good-commit>
wrangler pages deploy public --project-name designfitout-github
```

### DNS Rollback
```bash
# If DNS changes cause issues, remove custom domains temporarily
wrangler pages domain remove designfitout.com
wrangler pages domain remove fitoutlab.app
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Health Endpoints Not Responding
**Symptoms:** `/health` or `/api/status` return 404

**Solution:**
```bash
# Check function deployment
wrangler dev functions/index.js

# Verify function routes
wrangler routes list
```

#### 2. CORS Errors
**Symptoms:** Browser console shows CORS errors

**Solution:**
```bash
# Check CORS configuration in functions/index.js
grep -A 10 "CORS" functions/index.js

# Verify allowed origins include your domains
```

#### 3. Domain Resolution Issues
**Symptoms:** Domains don't resolve or show wrong content

**Solution:**
```bash
# Check DNS propagation
dig designfitout.com
dig fitoutlab.app

# Verify Cloudflare DNS settings in dashboard
```

#### 4. Performance Issues
**Symptoms:** Slow loading times

**Solution:**
```bash
# Check asset optimization
ls -la public/
# Ensure images are optimized, CSS/JS minified

# Verify Cloudflare caching rules
wrangler pages cache purge --everything
```

#### 5. Build/Deployment Failures
**Symptoms:** Deployment fails or times out

**Solution:**
```bash
# Check build logs
wrangler pages deployment list --project-name designfitout-github

# Verify no banned terms in codebase
npm run test:brand-neutrality

# Check file structure
ls -la public/ functions/
```

### Debug Commands
```bash
# View deployment logs
wrangler tail

# Test functions locally
wrangler dev

# Check current deployment status
wrangler pages deployment list

# View DNS settings
wrangler pages domain list
```

### Support Contacts
- **Repository Issues:** Create GitHub issue
- **Cloudflare Support:** Cloudflare Dashboard → Support
- **Emergency Contact:** Repository maintainers

## 📊 Monitoring and Alerts

### Set up monitoring for:
1. **Uptime monitoring** for both domains
2. **Performance monitoring** (Core Web Vitals)
3. **Error rate monitoring** for API endpoints
4. **SSL certificate expiration** alerts

### Key Metrics to Monitor:
- Response time < 2 seconds
- Uptime > 99.9%
- Error rate < 1%
- Core Web Vitals compliance

## 📝 Deployment Log Template

```
Date: YYYY-MM-DD
Deployer: [Name]
Branch: [branch-name]
Commit: [commit-hash]

Pre-deployment checks:
[ ] test-brand-neutrality.js passed
[ ] test-mrketoz-crm.js passed
[ ] Playwright smoke tests passed
[ ] Configuration validated

Deployment steps:
[ ] Pages deployed
[ ] Functions deployed
[ ] Domains configured
[ ] SSL certificates verified

Post-deployment verification:
[ ] Health endpoints responding
[ ] Both domains accessible
[ ] API endpoints functional
[ ] Performance acceptable
[ ] Security headers present

Issues encountered: [None/List issues]
Rollback required: [Yes/No]
```

## 🎉 Success Criteria

Deployment is considered successful when:
- ✅ All pre-deployment tests pass
- ✅ Both domains (designfitout.com, fitoutlab.app) are accessible
- ✅ Health endpoints return proper responses
- ✅ MrketOz CRM chat functionality works
- ✅ No console errors in browser
- ✅ Performance metrics are within acceptable ranges
- ✅ Mobile responsiveness is maintained
- ✅ Security headers are properly configured