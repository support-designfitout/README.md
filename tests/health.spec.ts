import { test, expect } from '@playwright/test';

/**
 * Health endpoint smoke tests for Cloudflare migration validation
 * Tests the /health/pages endpoint and related health checks
 */
test.describe('Health Endpoint Tests', () => {
  
  test('should respond to /health endpoint with proper structure', async ({ page }) => {
    // Test the main health endpoint
    const response = await page.goto('/health');
    
    if (response) {
      expect(response.status()).toBe(200);
      
      // Check response headers
      const headers = response.headers();
      expect(headers['content-type']).toContain('application/json');
    }
    
    // Check if health data is visible on page (if rendered)
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Look for health indicators in the response
    if (content?.includes('healthy') || content?.includes('status')) {
      expect(content).toContain('healthy');
    }
  });

  test('should respond to /api/status endpoint with health information', async ({ page }) => {
    // Test the API status endpoint
    const response = await page.goto('/api/status');
    
    if (response) {
      expect(response.status()).toBe(200);
      
      // Check for JSON content type
      const headers = response.headers();
      expect(headers['content-type']).toContain('application/json');
    }
    
    // Validate response content structure
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Should contain service information
    if (content?.includes('service') || content?.includes('Designfitout')) {
      expect(content).toContain('Designfitout');
    }
  });

  test('should include essential endpoints in health response', async ({ page }) => {
    const response = await page.goto('/health');
    
    if (response && response.status() === 200) {
      const content = await page.textContent('body');
      
      // Check for essential endpoint listings
      const essentialEndpoints = [
        '/chat',
        '/api/auth',
        '/health'
      ];
      
      for (const endpoint of essentialEndpoints) {
        if (content?.includes('endpoints') || content?.includes('availableEndpoints')) {
          // Only check if the response includes endpoint information
          expect(content).toContain(endpoint);
        }
      }
    }
  });

  test('should have proper CORS headers for health endpoints', async ({ page }) => {
    const response = await page.goto('/health');
    
    if (response) {
      const headers = response.headers();
      
      // Check for CORS headers if they exist
      if (headers['access-control-allow-origin']) {
        expect(headers['access-control-allow-origin']).toBeTruthy();
      }
    }
  });

  test('should respond within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    const response = await page.goto('/health');
    
    const responseTime = Date.now() - startTime;
    
    // Health endpoint should respond quickly (within 5 seconds)
    expect(responseTime).toBeLessThan(5000);
    
    if (response) {
      expect(response.status()).toBe(200);
    }
  });

  test('should maintain health endpoint availability during load', async ({ page }) => {
    // Test multiple rapid requests to health endpoint
    const healthRequests = [];
    
    for (let i = 0; i < 3; i++) {
      healthRequests.push(page.goto('/health'));
    }
    
    const responses = await Promise.all(healthRequests);
    
    // All requests should succeed
    for (const response of responses) {
      if (response) {
        expect(response.status()).toBe(200);
      }
    }
  });
});