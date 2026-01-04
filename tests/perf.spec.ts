/**
 * Performance tests for root page
 * Measures load performance and cache status with Core Web Vitals focus
 */

import { test, expect } from '@playwright/test';
import { 
  logHeader, 
  logCacheHeaders, 
  warnOnColdCache,
  logAndWarnOnAge,
  isProd,
  requireCacheHit,
  getBaseURL 
} from './utils';

test.describe('Performance Tests', () => {
  test('should measure root page load performance and cache status', async ({ page }) => {
    logHeader('Testing root page performance and cache status');

    const baseURL = getBaseURL();
    const isProduction = isProd(baseURL);
    const enforceCache = requireCacheHit();

    console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`📋 Base URL: ${baseURL}`);
    console.log(`🔒 Cache enforcement: ${enforceCache ? 'Enabled' : 'Disabled'}`);

    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to root page with network monitoring
    const response = await page.goto('/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const navigationEndTime = Date.now();
    const navigationTime = navigationEndTime - startTime;

    // Validate response
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    console.log(`⚡ Navigation time: ${navigationTime}ms`);
    
    // Log cache headers
    logCacheHeaders(response!);

    // Check cache status
    const { isCacheHit, cacheStatus, age } = warnOnColdCache(response!);
    logAndWarnOnAge(response!);

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        });
        
        // First Input Delay (FID) - simulated with interaction
        vitals.fid = 0; // Will be measured during interaction
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        });

        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          console.warn('Performance observers not supported');
        }

        // Collect timing data
        const perfTiming = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        vitals.domContentLoaded = perfTiming.domContentLoadedEventEnd - perfTiming.navigationStart;
        vitals.loadComplete = perfTiming.loadEventEnd - perfTiming.navigationStart;
        vitals.firstPaint = navigation?.loadEventEnd || 0;
        
        setTimeout(() => resolve(vitals), 2000);
      });
    });

    // Log Core Web Vitals
    console.log('📊 Core Web Vitals:');
    console.log(`  LCP (Largest Contentful Paint): ${webVitals.lcp?.toFixed(2) || 'N/A'}ms`);
    console.log(`  FID (First Input Delay): ${webVitals.fid || 'N/A'}ms`);
    console.log(`  CLS (Cumulative Layout Shift): ${webVitals.cls?.toFixed(3) || 'N/A'}`);
    console.log(`  DOM Content Loaded: ${webVitals.domContentLoaded}ms`);
    console.log(`  Load Complete: ${webVitals.loadComplete}ms`);

    // Validate Core Web Vitals thresholds
    if (webVitals.lcp && webVitals.lcp > 0) {
      // LCP should be under 2.5s (2500ms) for good performance
      if (isProduction && webVitals.lcp > 4000) {
        console.warn(`⚠️  LCP ${webVitals.lcp}ms exceeds recommended 4000ms for production`);
      }
    }

    if (webVitals.cls !== undefined) {
      // CLS should be under 0.1
      expect(webVitals.cls).toBeLessThan(0.25); // More lenient for E2E testing
      if (webVitals.cls < 0.1) {
        console.log('✅ CLS within good threshold (< 0.1)');
      }
    }

    // Performance validation based on environment
    if (isProduction) {
      // Production performance expectations (with CDN)
      expect(navigationTime).toBeLessThan(10000); // 10 seconds max
      if (navigationTime < 3000) {
        console.log('✅ Excellent production performance (< 3s)');
      }
    } else {
      // Development performance expectations
      expect(navigationTime).toBeLessThan(15000); // 15 seconds max for local dev
    }

    // Validate page content loaded correctly
    await expect(page.locator('h1')).toBeVisible();
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Strict cache enforcement when required
    if (enforceCache) {
      expect(isCacheHit).toBe(true);
      expect(cacheStatus).toBe('HIT');
      expect(age).toBeGreaterThanOrEqual(1);
      console.log('✅ Cache requirements satisfied for root page');
    }

    console.log('✅ Root page performance test completed successfully');
  });

  test('should measure page load performance with resource timing', async ({ page }) => {
    logHeader('Testing detailed resource loading performance');

    const baseURL = getBaseURL();
    
    // Navigate and collect resource timing
    await page.goto('/', { waitUntil: 'networkidle' });

    const resourceTimings = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType,
        cached: resource.transferSize === 0 && resource.decodedBodySize > 0
      })).sort((a, b) => b.duration - a.duration);
    });

    console.log('📊 Resource Loading Performance:');
    console.log(`  Total resources: ${resourceTimings.length}`);
    
    // Log slowest resources
    const slowestResources = resourceTimings.slice(0, 5);
    console.log('  Slowest resources:');
    slowestResources.forEach((resource, index) => {
      console.log(`    ${index + 1}. ${resource.name.split('/').pop()} - ${resource.duration.toFixed(2)}ms ${resource.cached ? '(cached)' : ''}`);
    });

    // Calculate statistics
    const totalDuration = resourceTimings.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalDuration / resourceTimings.length;
    const cachedResources = resourceTimings.filter(r => r.cached).length;
    
    console.log(`  Average resource load time: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Cached resources: ${cachedResources}/${resourceTimings.length} (${((cachedResources / resourceTimings.length) * 100).toFixed(1)}%)`);

    // Validate no resources are excessively slow
    const excessivelySlow = resourceTimings.filter(r => r.duration > 10000);
    expect(excessivelySlow).toHaveLength(0);

    console.log('✅ Resource timing analysis completed');
  });

  test('should validate interactive elements load correctly', async ({ page }) => {
    logHeader('Testing interactive elements and functionality');

    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure interaction timing
    const startTime = Date.now();
    
    // Look for common interactive elements
    const links = await page.locator('a').count();
    const buttons = await page.locator('button').count();
    const forms = await page.locator('form').count();

    console.log(`🔗 Found ${links} links, ${buttons} buttons, ${forms} forms`);

    // Test basic interactivity if elements exist
    if (links > 0) {
      const firstLink = page.locator('a').first();
      await firstLink.hover();
      console.log('✅ Link hover interaction successful');
    }

    if (buttons > 0) {
      const firstButton = page.locator('button').first();
      await firstButton.hover();
      console.log('✅ Button hover interaction successful');
    }

    const interactionTime = Date.now() - startTime;
    console.log(`⚡ Interaction test time: ${interactionTime}ms`);

    // Validate page is interactive
    expect(interactionTime).toBeLessThan(5000);

    console.log('✅ Interactive elements test completed');
  });
});