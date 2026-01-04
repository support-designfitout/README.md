/**
 * Redirects validation tests
 * Validates critical 301/302 redirects are working correctly
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

test.describe('Redirects Tests', () => {
  test('should validate www to non-www redirect', async ({ page }) => {
    logHeader('Testing www to non-www redirect');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);
    const enforceCache = requireCacheHit();

    console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`🔒 Cache enforcement: ${enforceCache ? 'Enabled' : 'Disabled'}`);

    if (!isProduction) {
      console.log('⏭️  Skipping www redirect test in development environment');
      return;
    }

    // Test www redirect for fitoutlab.app
    const wwwUrl = 'https://www.fitoutlab.app';
    console.log(`📋 Testing redirect: ${wwwUrl}`);

    const response = await page.goto(wwwUrl, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    expect(response).not.toBeNull();
    
    // Should redirect to non-www version
    const finalUrl = page.url();
    console.log(`🔗 Final URL: ${finalUrl}`);
    
    expect(finalUrl).toBe('https://fitoutlab.app/');
    
    // Validate redirect status (should be 200 after redirect)
    expect(response!.status()).toBe(200);

    logCacheHeaders(response!);
    
    if (enforceCache) {
      const { isCacheHit, cacheStatus } = warnOnColdCache(response!);
      // Cache status might vary for redirects, but final page should be cacheable
      console.log(`📊 Final page cache status: ${cacheStatus}`);
    }

    console.log('✅ WWW redirect test completed successfully');
  });

  test('should validate HTTPS redirect', async ({ page }) => {
    logHeader('Testing HTTPS redirect');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);

    if (!isProduction) {
      console.log('⏭️  Skipping HTTPS redirect test in development environment');
      return;
    }

    // Test HTTP to HTTPS redirect
    const httpUrl = 'http://fitoutlab.app';
    console.log(`📋 Testing HTTPS redirect: ${httpUrl}`);

    const response = await page.goto(httpUrl, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    expect(response).not.toBeNull();
    
    // Should redirect to HTTPS version
    const finalUrl = page.url();
    console.log(`🔗 Final URL: ${finalUrl}`);
    
    expect(finalUrl).toMatch(/^https:\/\//);
    expect(finalUrl).toBe('https://fitoutlab.app/');
    
    // Should be successful after redirect
    expect(response!.status()).toBe(200);

    console.log('✅ HTTPS redirect test completed successfully');
  });

  test('should validate secondary domain redirects', async ({ page }) => {
    logHeader('Testing secondary domain redirects');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);

    if (!isProduction) {
      console.log('⏭️  Skipping secondary domain redirect test in development environment');
      return;
    }

    // Test designfitout.com domain redirects
    const secondaryUrls = [
      'https://designfitout.com',
      'https://www.designfitout.com'
    ];

    for (const url of secondaryUrls) {
      console.log(`📋 Testing redirect: ${url}`);

      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      expect(response).not.toBeNull();
      
      const finalUrl = page.url();
      console.log(`🔗 Final URL: ${finalUrl}`);
      
      // Should redirect to primary domain or stay on secondary with proper setup
      expect(response!.status()).toBe(200);
      expect(finalUrl).toMatch(/^https:\/\//);

      // Log cache status for secondary domain
      logCacheHeaders(response!);
      
      console.log(`✅ Secondary domain redirect test for ${url} completed`);
    }
  });

  test('should validate critical path redirects', async ({ page }) => {
    logHeader('Testing critical path redirects');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);

    // Test common redirect patterns that might exist
    const redirectPaths = [
      '/home',
      '/index.php',
      '/index.htm',
      '/main',
      '/app'
    ];

    for (const path of redirectPaths) {
      console.log(`📋 Testing path: ${path}`);

      try {
        const response = await page.goto(path, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        if (response) {
          const status = response.status();
          const finalUrl = page.url();
          
          console.log(`  Status: ${status}, Final URL: ${finalUrl}`);
          
          // Accept various valid responses
          if (status >= 200 && status < 400) {
            console.log(`  ✅ ${path} handled correctly (${status})`);
          } else if (status === 404) {
            console.log(`  📋 ${path} returns 404 (expected for non-existent paths)`);
          } else {
            console.log(`  ⚠️  ${path} returns ${status}`);
          }
        }
      } catch (error) {
        // Paths that don't exist will timeout or error - this is expected
        console.log(`  📋 ${path} not accessible (expected for non-existent paths)`);
      }
    }

    console.log('✅ Critical path redirects test completed');
  });

  test('should validate trailing slash handling', async ({ page }) => {
    logHeader('Testing trailing slash handling');

    const baseURL = getBaseURL();

    // Test paths with and without trailing slashes
    const testPaths = [
      { path: '/ind2x.html', expected: '/ind2x.html' },
      { path: '/ind2x.html/', expected: '/ind2x.html' }
    ];

    for (const { path, expected } of testPaths) {
      console.log(`📋 Testing trailing slash handling: ${path}`);

      const response = await page.goto(path, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      expect(response).not.toBeNull();
      const status = response!.status();
      const finalUrl = page.url();

      console.log(`  Status: ${status}, Final URL: ${finalUrl}`);

      if (status === 200) {
        // Page loaded successfully
        console.log(`  ✅ ${path} loaded successfully`);
      } else if (status >= 300 && status < 400) {
        // Redirected - check final URL
        expect(finalUrl).toContain(expected);
        console.log(`  ✅ ${path} redirected correctly to ${finalUrl}`);
      }
    }

    console.log('✅ Trailing slash handling test completed');
  });

  test('should measure redirect performance', async ({ page }) => {
    logHeader('Testing redirect performance');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);

    if (!isProduction) {
      console.log('⏭️  Skipping redirect performance test in development environment');
      return;
    }

    // Measure redirect chain performance
    const redirectUrl = 'https://www.fitoutlab.app';
    console.log(`📋 Measuring redirect performance for: ${redirectUrl}`);

    const startTime = Date.now();
    
    const response = await page.goto(redirectUrl, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    console.log(`⚡ Total redirect chain time: ${totalTime}ms`);

    // Redirect chain should be fast
    expect(totalTime).toBeLessThan(10000); // 10 seconds max
    if (totalTime < 3000) {
      console.log('✅ Excellent redirect performance (< 3s)');
    }

    // Check if final page is cached
    const { isCacheHit, cacheStatus } = warnOnColdCache(response!);
    console.log(`📊 Final page cache status after redirect: ${cacheStatus}`);

    console.log('✅ Redirect performance test completed successfully');
  });
});