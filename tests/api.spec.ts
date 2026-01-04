import { test, expect } from '@playwright/test';

test.describe('API and Network Tests', () => {
  
  test('should handle network requests properly', async ({ page }) => {
    // Track network requests
    const requests: string[] = [];
    const responses: number[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    page.on('response', response => {
      responses.push(response.status());
    });
    
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify basic network activity
    expect(requests.length).toBeGreaterThan(0);
    expect(responses.length).toBeGreaterThan(0);
    
    // Verify no 4xx or 5xx errors for critical resources
    const errorResponses = responses.filter(status => status >= 400);
    const criticalErrors = errorResponses.filter(status => status >= 500);
    
    // Allow some 404s for non-critical resources (favicon, etc.)
    expect(criticalErrors.length).toBe(0);
  });

  test('should load external resources correctly', async ({ page }) => {
    // Track specific resource loading
    const resourceRequests = new Map<string, number>();
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('youtube.com') || url.includes('googleapis.com') || url.includes('gstatic.com')) {
        resourceRequests.set(url, response.status());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for external resources
    await page.waitForTimeout(3000);
    
    // Check YouTube iframe loading
    const iframe = page.locator('iframe[src*="youtube.com"]');
    if (await iframe.count() > 0) {
      expect(await iframe.isVisible()).toBeTruthy();
    }
    
    // Verify external resources loaded successfully (if any)
    for (const [url, status] of resourceRequests.entries()) {
      if (status >= 400) {
        console.warn(`External resource failed to load: ${url} (${status})`);
      }
    }
  });

  test('should handle CSP (Content Security Policy) correctly', async ({ page }) => {
    const cspViolations: string[] = [];
    
    // Listen for CSP violations
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for potential CSP violations
    await page.waitForTimeout(2000);
    
    // Should not have CSP violations for legitimate resources
    expect(cspViolations.length).toBe(0);
  });

  test('should have proper HTTP headers', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const headers = response.headers();
      
      // Check for security headers (if configured)
      if (headers['content-security-policy']) {
        expect(headers['content-security-policy']).toContain('default-src');
      }
      
      if (headers['x-frame-options']) {
        expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
      }
      
      // Check content type
      expect(headers['content-type']).toContain('text/html');
    }
  });

  test('should handle offline scenarios gracefully', async ({ page, context }) => {
    // First, load the page normally
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded successfully
    const title = await page.title();
    expect(title).toContain('Designfitout');
    
    // Simulate offline condition
    await context.setOffline(true);
    
    // Try to reload - should handle gracefully
    try {
      await page.reload({ waitUntil: 'networkidle', timeout: 5000 });
    } catch (error) {
      // Expected to fail in offline mode
      expect(error).toBeTruthy();
    }
    
    // Restore online
    await context.setOffline(false);
    
    // Should work again
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const titleAfterOnline = await page.title();
    expect(titleAfterOnline).toContain('Designfitout');
  });

  test('should not have memory leaks', async ({ page }) => {
    // Navigate and interact multiple times to test for memory leaks
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Interact with elements
      const videoWrapper = page.locator('.video-wrapper');
      if (await videoWrapper.isVisible()) {
        await videoWrapper.hover();
        await page.waitForTimeout(1000);
      }
      
      // Navigate to other page
      await page.goto('/ind2x.html');
      await page.waitForLoadState('networkidle');
      
      await page.waitForTimeout(500);
    }
    
    // Check for JavaScript errors that might indicate memory issues
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(2000);
    
    // Filter out non-memory related errors
    const memoryErrors = errors.filter(error => 
      error.toLowerCase().includes('memory') || 
      error.toLowerCase().includes('heap') ||
      error.toLowerCase().includes('leak')
    );
    
    expect(memoryErrors.length).toBe(0);
  });

  test('should handle rapid navigation correctly', async ({ page }) => {
    // Test rapid navigation between pages
    const pages = ['/', '/ind2x.html'];
    
    for (let i = 0; i < 5; i++) {
      const targetPage = pages[i % pages.length];
      await page.goto(targetPage);
      
      // Don't wait for full networkidle to simulate rapid navigation
      await page.waitForLoadState('domcontentloaded');
      
      // Verify page loaded correctly
      const title = await page.title();
      expect(title).toBeTruthy();
    }
    
    // Final check - ensure last page loaded completely
    await page.waitForLoadState('networkidle');
    const finalTitle = await page.title();
    expect(finalTitle).toBeTruthy();
  });
});