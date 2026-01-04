# Smoke E2E Tests Documentation

## Overview

The Smoke E2E test suite provides comprehensive end-to-end testing with strict cache policy enforcement for the Designfitout platform. These tests run against the production environment to validate performance, cache behavior, and critical functionality.

## Key Features

### 🔒 Strict Cache Policy Enforcement
- **Cache Status Validation**: Tests verify `cf-cache-status: HIT` from CDN
- **Cache Age Validation**: Ensures cache age ≥ 1 second
- **Build Failure on Cold Cache**: Tests fail if cache is not warm when `REQUIRE_CACHE_HIT=true`
- **Production Focus**: Cache validation only enforced in production environment

### 🧪 Test Suites

#### 1. Health Tests (`tests/health.spec.ts`)
- **Endpoint**: `/health/pages`
- **Validates**: Response correctness, latency, cache status
- **Metrics**: Response time, cache headers, JSON structure
- **Thresholds**: <5s production, <10s development

#### 2. Performance Tests (`tests/perf.spec.ts`)
- **Target**: Root page (`/`)
- **Validates**: Load performance, Core Web Vitals, cache status
- **Metrics**: 
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay) 
  - CLS (Cumulative Layout Shift)
  - Resource timing analysis
- **Thresholds**: <10s navigation (production), <15s (development)

#### 3. Redirects Tests (`tests/redirects.spec.ts`)
- **Validates**: Critical 301/302 redirects
- **Coverage**: 
  - www → non-www redirects
  - HTTP → HTTPS redirects
  - Secondary domain handling
  - Trailing slash normalization
- **Performance**: <10s redirect chains

### 🛠️ Test Utilities (`tests/utils.ts`)

```typescript
// Environment detection
isProd(baseURL?: string): boolean

// Logging helpers
logHeader(message: string): void
logCacheHeaders(response: Response): void

// Cache analysis
warnOnColdCache(response: Response): { isCacheHit: boolean, cacheStatus: string, age: number }
logAndWarnOnAge(response: Response, minAge?: number): void

// Configuration
requireCacheHit(): boolean
getBaseURL(): string
```

## CI/CD Integration

### Workflow: `.github/workflows/smoke-e2e.yml`

**Triggers:**
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Environment Variables:**
```yaml
BASE_URL: https://app.fitoutlab.app
REQUIRE_CACHE_HIT: "true"
CI: true
```

**Execution Order:**
1. Brand neutrality validation
2. CRM functionality tests  
3. Smoke E2E tests (health, performance, redirects)
4. Test result artifacts upload
5. PR comment with summary

### Cache Warmup Validation

The workflow includes a separate job to check production cache status before running tests:

```bash
# Check cache status
curl -I https://app.fitoutlab.app/
# Validates cf-cache-status and age headers
```

## Usage Instructions

### Local Development
```bash
# Install dependencies
npm install
npm run install:browsers

# Run structure validation (no browser required)
npm run test:e2e-structure

# Run against local development server
npm run dev  # Start local server
npm run test # Run E2E tests (local environment)
```

### Production Testing
```bash
# Set environment variables
export BASE_URL=https://app.fitoutlab.app
export REQUIRE_CACHE_HIT=true

# Run production tests
npm run test
```

### Available Commands
```bash
npm run test                    # Full E2E test suite
npm run test:headed            # Run with browser UI visible
npm run test:ui                # Interactive test runner
npm run test:debug             # Debug mode
npm run test:validate          # Minimal validation tests
npm run test:e2e-structure     # Structure validation only
npm run test:all               # All validation + structure tests
npm run test:all-with-e2e      # All tests including E2E
```

## Test Results & Reporting

### Artifacts Generated
- **HTML Report**: Interactive test results (`playwright-report/`)
- **JSON Results**: Machine-readable results (`test-results/results.json`)
- **Screenshots**: Failure screenshots (on test failures)
- **Videos**: Failure recordings (on test failures)

### PR Integration
Automated comments include:
- Test statistics (passed/failed/skipped)
- Cache validation results
- Performance metrics
- Links to detailed reports

## Environment-Specific Behavior

### Production Environment
- **Cache Enforcement**: Required when `REQUIRE_CACHE_HIT=true`
- **Performance Thresholds**: Stricter (cached responses expected)
- **Redirect Testing**: Full redirect chain validation
- **Domain Testing**: Primary and secondary domains

### Development Environment  
- **Cache Enforcement**: Disabled (local development server)
- **Performance Thresholds**: More lenient
- **Redirect Testing**: Limited/skipped
- **Health Endpoint**: Tests local JSON files

## Health Endpoint

### Static Files
- **JSON**: `/health/pages.json` - Machine-readable health data
- **HTML**: `/health/pages` - Human-readable health page with API support

### Response Format
```json
{
  "status": "healthy",
  "service": "Designfitout Static Pages Health Check",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "pages": [
    {
      "url": "/",
      "path": "/index.html",
      "status": "active",
      "description": "Main landing page with video integration"
    }
  ],
  "features": ["Video Integration", "Strategic Analysis"],
  "domains": {
    "primary": "fitoutlab.app",
    "secondary": "designfitout.com"
  },
  "cache": {
    "enabled": true,
    "maxAge": 3600
  }
}
```

## Troubleshooting

### Common Issues

#### Cache Misses in Production
```
❌ Cache status: MISS (expected: HIT)
```
**Solution**: Warm cache by visiting pages manually or adjust cache policy

#### Performance Threshold Failures
```
❌ Navigation time 12000ms exceeds threshold 10000ms
```
**Solution**: Check network conditions, CDN performance, or adjust thresholds

#### Browser Installation Issues
```
Error: browserType.launch: Executable doesn't exist
```
**Solution**: Run `npx playwright install --with-deps`

### Debug Commands
```bash
# Check cache status manually
curl -I https://app.fitoutlab.app/

# Test health endpoint
curl https://app.fitoutlab.app/health/pages.json

# Run single test file
npx playwright test tests/health.spec.ts --headed

# Generate trace
npx playwright test --trace on
```

## Integration with Existing Test Suite

The smoke E2E tests integrate seamlessly with the existing validation framework:

```bash
npm run test:all-with-e2e
```

**Execution order:**
1. `test-brand-neutrality.js` - Brand neutrality validation
2. `test-mrketoz-crm.js` - CRM functionality tests  
3. `test-mobile-auth.js` - Authentication API tests
4. `test-vibe-coding-features.js` - AI module validation
5. `test-e2e-structure.js` - E2E test structure validation
6. Playwright E2E tests - Full browser-based testing

This comprehensive approach ensures both code-level validation and end-user experience validation.