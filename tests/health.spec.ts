/**
 * Health endpoint E2E tests
 * Validates /health/pages endpoint for correctness, latency, and cache status
 */

import { test, expect } from '@playwright/test';
import { 
  logHeader, 
  logCacheHeaders, 
  warnOnColdCache, 
  isProd,
  requireCacheHit,
  getBaseURL 
} from './utils';

test.describe('Health Endpoint Tests', () => {
  test('should validate /health/pages endpoint', async ({ page }) => {
    logHeader('Testing /health/pages endpoint');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);
    const enforceCache = requireCacheHit();

    console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`📋 Base URL: ${baseURL}`);
    console.log(`🔒 Cache enforcement: ${enforceCache ? 'Enabled' : 'Disabled'}`);

    const startTime = Date.now();
    
    // Navigate to health endpoint
    const response = await page.goto('/health/pages');
    const endTime = Date.now();
    const latency = endTime - startTime;

    // Validate response status
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    // Log performance metrics
    console.log(`⚡ Response latency: ${latency}ms`);
    
    // Log cache headers
    logCacheHeaders(response!);

    // Check cache status
    const { isCacheHit, cacheStatus, age } = warnOnColdCache(response!);

    // Validate content type
    expect(response!.headers()['content-type']).toContain('application/json');

    // Parse and validate response body
    const healthData = await response!.json();
    
    // Validate health data structure
    expect(healthData).toHaveProperty('status');
    expect(healthData.status).toBe('healthy');
    expect(healthData).toHaveProperty('pages');
    expect(Array.isArray(healthData.pages)).toBe(true);

    // Validate required pages are present
    const pageUrls = healthData.pages.map((page: any) => page.url || page.path);
    expect(pageUrls).toContain('/');
    expect(pageUrls).toContain('/ind2x.html');

    // Performance validation
    if (isProduction) {
      // In production, response should be fast (cached)
      expect(latency).toBeLessThan(5000);
      console.log(`✅ Production latency acceptable: ${latency}ms`);
    } else {
      // In development, be more lenient
      expect(latency).toBeLessThan(10000);
      console.log(`✅ Development latency acceptable: ${latency}ms`);
    }

    // Strict cache enforcement when required
    if (enforceCache) {
      expect(isCacheHit).toBe(true);
      expect(cacheStatus).toBe('HIT');
      expect(age).toBeGreaterThanOrEqual(1);
      console.log('✅ Cache requirements satisfied');
    }

    console.log('✅ Health endpoint test completed successfully');
  });

  test('should handle health endpoint errors gracefully', async ({ page }) => {
    logHeader('Testing health endpoint error handling');

    const baseURL = getBaseURL();
    
    // Test a non-existent health endpoint
    const response = await page.goto('/health/nonexistent', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Should return 404 or redirect to a valid page
    expect(response).not.toBeNull();
    const status = response!.status();
    
    // Accept 404 or redirect statuses
    expect([200, 301, 302, 404]).toContain(status);
    
    console.log(`📊 Non-existent health endpoint status: ${status}`);
    console.log('✅ Error handling test completed');
  });

  test('should validate health endpoint response time consistency', async ({ page }) => {
    logHeader('Testing health endpoint response time consistency');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);
    const measurements = [];

    // Make multiple requests to measure consistency
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      const response = await page.goto('/health/pages', { 
        waitUntil: 'networkidle' 
      });
      const endTime = Date.now();
      const latency = endTime - startTime;

      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
      
      measurements.push(latency);
      console.log(`📊 Request ${i + 1} latency: ${latency}ms`);

      // Small delay between requests
      await page.waitForTimeout(1000);
    }

    // Calculate statistics
    const avgLatency = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const maxLatency = Math.max(...measurements);
    const minLatency = Math.min(...measurements);

    console.log(`📈 Average latency: ${avgLatency.toFixed(2)}ms`);
    console.log(`📈 Max latency: ${maxLatency}ms`);
    console.log(`📈 Min latency: ${minLatency}ms`);

    // Validate consistency
    if (isProduction) {
      // In production with caching, should be consistently fast
      expect(maxLatency - minLatency).toBeLessThan(2000);
      expect(avgLatency).toBeLessThan(3000);
    }

    console.log('✅ Response time consistency test completed');
  });
});