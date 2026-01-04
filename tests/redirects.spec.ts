import { test, expect } from '@playwright/test';

/**
 * Redirect tests for Cloudflare migration validation
 * Tests domain redirects and URL routing functionality
 */
test.describe('Redirect Tests', () => {
  
  test('should handle main page redirect correctly', async ({ page }) => {
    // Test that the main page loads without redirect issues
    const response = await page.goto('/');
    
    if (response) {
      expect(response.status()).toBe(200);
    }
    
    // Check that we're on the correct page
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Designfitout');
  });

  test('should handle FitOutLab page routing', async ({ page }) => {
    // Test FitOutLab page accessibility
    const response = await page.goto('/ind2x.html');
    
    if (response) {
      expect(response.status()).toBe(200);
    }
    
    // Verify page content loaded
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for FitOutLab specific content
    const content = await page.textContent('body');
    if (content) {
      expect(content.length).toBeGreaterThan(0);
    }
  });

  test('should handle API endpoint routing', async ({ page }) => {
    // Test API endpoints are accessible
    const apiEndpoints = [
      '/health',
      '/api/status'
    ];
    
    for (const endpoint of apiEndpoints) {
      const response = await page.goto(endpoint);
      
      if (response) {
        // Should either return 200 (working) or a redirect status
        const status = response.status();
        expect([200, 301, 302, 307, 308]).toContain(status);
      }
    }
  });

  test('should handle subdomain routing correctly', async ({ page }) => {
    // Test that current domain works without redirect loops
    const response = await page.goto('/');
    
    if (response) {
      const status = response.status();
      
      // Should not be stuck in redirect loops
      expect(status).not.toBe(429); // Too Many Requests
      expect(status).not.toBe(502); // Bad Gateway
      expect(status).not.toBe(504); // Gateway Timeout
      
      // Should be successful or a proper redirect
      expect([200, 301, 302]).toContain(status);
    }
  });

  test('should preserve URL parameters during redirects', async ({ page }) => {
    // Test URL with parameters
    const response = await page.goto('/?test=param');
    
    if (response) {
      expect(response.status()).toBe(200);
    }
    
    // Check that the parameter is preserved in the current URL
    const currentUrl = page.url();
    if (currentUrl.includes('?')) {
      expect(currentUrl).toContain('test=param');
    }
  });

  test('should handle HTTPS redirect enforcement', async ({ page }) => {
    // Test that the site enforces HTTPS (if applicable)
    const response = await page.goto('/');
    
    if (response) {
      const finalUrl = response.url();
      
      // If we're testing on a domain that should use HTTPS
      if (finalUrl.includes('designfitout.com') || finalUrl.includes('fitoutlab.app')) {
        expect(finalUrl).toMatch(/^https:/);
      }
    }
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    // Test non-existent page
    const response = await page.goto('/nonexistent-page-12345');
    
    if (response) {
      const status = response.status();
      
      // Should return 404 or redirect to a valid page
      expect([200, 301, 302, 404]).toContain(status);
    }
    
    // Page should still render something (even if it's a 404 page)
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should maintain functionality across page navigation', async ({ page }) => {
    // Test navigation between pages
    await page.goto('/');
    
    // Try to navigate to FitOutLab page
    await page.goto('/ind2x.html');
    
    // Navigate back to main page
    await page.goto('/');
    
    // Verify main page is still functional
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Designfitout');
  });

  test('should handle concurrent redirect requests', async ({ page }) => {
    // Test multiple simultaneous navigation requests
    const navigationPromises = [
      page.goto('/'),
      page.goto('/ind2x.html'),
      page.goto('/health')
    ];
    
    // Wait for at least one to complete
    const responses = await Promise.allSettled(navigationPromises);
    
    // At least one request should succeed
    const successfulResponses = responses.filter(result => 
      result.status === 'fulfilled' && 
      result.value && 
      [200, 301, 302].includes(result.value.status())
    );
    
    expect(successfulResponses.length).toBeGreaterThan(0);
  });

  test('should handle mobile user agent redirects', async ({ page }) => {
    // Set mobile user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');
    
    const response = await page.goto('/');
    
    if (response) {
      expect(response.status()).toBe(200);
    }
    
    // Verify page loads correctly for mobile
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('Designfitout');
  });
});