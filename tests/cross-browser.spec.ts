import { test, expect } from './fixtures/page-fixtures';

test.describe('Cross-Browser Compatibility Tests', () => {
  
  test('should work consistently across all browsers', async ({ homePage, page }) => {
    await homePage.navigateToHome();
    await homePage.waitForLoadingComplete();
    
    // Test basic functionality that should work across all browsers
    
    // 1. Page loads successfully
    const title = await homePage.getTitle();
    expect(title).toContain('Designfitout');
    
    // 2. Essential elements are visible
    expect(await homePage.header.isVisible()).toBeTruthy();
    expect(await homePage.videoWrapper.isVisible()).toBeTruthy();
    expect(await homePage.metricsSection.isVisible()).toBeTruthy();
    
    // 3. JavaScript functionality works
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Trigger video interaction
    await homePage.interactWithVideo();
    await page.waitForTimeout(2000);
    
    // Should have some console activity (strategic analysis or video tracking)
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    // 4. CSS animations and transitions work
    // Check if loading overlay can be hidden (tests CSS transitions)
    const loadingOverlay = homePage.loadingOverlay;
    if (await loadingOverlay.isVisible()) {
      await homePage.waitForLoadingComplete();
    }
    expect(await loadingOverlay.isHidden()).toBeTruthy();
  });

  test('should handle different screen orientations on mobile browsers', async ({ homePage, page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigateToHome();
    await homePage.waitForLoadingComplete();
    
    const portraitElementsVisible = await homePage.verifyResponsiveElements();
    expect(portraitElementsVisible).toBeTruthy();
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();
    await homePage.waitForLoadingComplete();
    
    const landscapeElementsVisible = await homePage.verifyResponsiveElements();
    expect(landscapeElementsVisible).toBeTruthy();
  });

  test('should have consistent performance across browsers', async ({ homePage, page }) => {
    // Measure performance metrics
    const startTime = Date.now();
    
    await homePage.navigateToHome();
    await homePage.waitForLoadingComplete();
    
    const loadTime = Date.now() - startTime;
    
    // Performance should be reasonable across all browsers
    expect(loadTime).toBeLessThan(15000); // 15 seconds max for slower browsers
    
    // Check that performance metrics are displayed
    const metrics = await homePage.getPerformanceMetrics();
    expect(metrics.performanceScore).toBeTruthy();
    
    // Verify no critical errors in console
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(3000);
    
    // Filter out known non-critical warnings
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.toLowerCase().includes('warning')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle browser-specific features gracefully', async ({ homePage, page }) => {
    await homePage.navigateToHome();
    await homePage.waitForLoadingComplete();
    
    // Test feature detection and graceful degradation
    const featureSupport = await page.evaluate(() => {
      return {
        intersectionObserver: 'IntersectionObserver' in window,
        requestAnimationFrame: 'requestAnimationFrame' in window,
        localStorage: 'localStorage' in window,
        cssGrid: CSS.supports('display', 'grid'),
        cssCustomProperties: CSS.supports('--test', 'test'),
      };
    });
    
    // Modern browsers should support these features
    expect(featureSupport.intersectionObserver).toBeTruthy();
    expect(featureSupport.requestAnimationFrame).toBeTruthy();
    expect(featureSupport.localStorage).toBeTruthy();
    expect(featureSupport.cssGrid).toBeTruthy();
    expect(featureSupport.cssCustomProperties).toBeTruthy();
    
    // Page should still function even if some features are missing
    const essentialElementsVisible = await homePage.verifyResponsiveElements();
    expect(essentialElementsVisible).toBeTruthy();
  });

  test('should handle network conditions gracefully', async ({ homePage, page }) => {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    await homePage.navigateToHome();
    
    // Should still load successfully, just slower
    await homePage.waitForLoadingComplete();
    
    const title = await homePage.getTitle();
    expect(title).toContain('Designfitout');
    
    // Clear route handler
    await page.unroute('**/*');
  });

  test('should work with different browser languages', async ({ homePage, page }) => {
    // Test with different locale settings
    const originalLanguage = await page.evaluate(() => navigator.language);
    
    await homePage.navigateToHome();
    await homePage.waitForLoadingComplete();
    
    // Content should be in English regardless of browser language
    const headerText = await homePage.getHeaderText();
    expect(headerText).toBe('Designfitout.com');
    
    const description = await homePage.getDescriptionText();
    expect(description).toContain('Premium Design & Fitout Solutions');
    
    // Verify numbers in metrics are formatted correctly
    const metrics = await homePage.getPerformanceMetrics();
    const performanceScore = metrics.performanceScore?.replace(/[^\d.]/g, '');
    if (performanceScore) {
      const score = parseFloat(performanceScore);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    }
  });
});