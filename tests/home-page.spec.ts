import { test, expect } from './fixtures/page-fixtures';
import { TestHelpers } from './utils/test-helpers';

test.describe('Home Page Tests', () => {
  
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateToHome();
  });

  test('should load home page with all essential elements', async ({ homePage }) => {
    // Verify page loads completely
    await homePage.waitForLoadingComplete();
    
    // Check page title
    const title = await homePage.getTitle();
    expect(title).toContain('Designfitout');
    
    // Verify header is present
    const headerText = await homePage.getHeaderText();
    expect(headerText).toBe('Designfitout.com');
    
    // Verify description is present
    const description = await homePage.getDescriptionText();
    expect(description).toContain('Premium Design & Fitout Solutions');
  });

  test('should display video component correctly', async ({ homePage }) => {
    await homePage.waitForLoadingComplete();
    
    // Check if video wrapper is visible
    expect(await homePage.videoWrapper.isVisible()).toBeTruthy();
    
    // Check if video iframe is loaded
    const isVideoLoaded = await homePage.isVideoLoaded();
    expect(isVideoLoaded).toBeTruthy();
    
    // Verify video iframe has correct attributes
    const iframe = homePage.videoIframe;
    const src = await iframe.getAttribute('src');
    expect(src).toContain('youtube.com/embed');
    expect(src).toContain('enablejsapi=1');
  });

  test('should display performance metrics', async ({ homePage }) => {
    await homePage.waitForLoadingComplete();
    
    // Get performance metrics
    const metrics = await homePage.getPerformanceMetrics();
    
    // Verify metrics are displayed
    expect(metrics.performanceScore).toBeTruthy();
    expect(metrics.marketPosition).toBeTruthy();
    expect(metrics.innovationIndex).toBeTruthy();
    expect(metrics.userEngagement).toBeTruthy();
    
    // Verify performance score is numeric
    const scoreText = metrics.performanceScore?.replace(/[^\d.]/g, '');
    const score = parseFloat(scoreText || '0');
    expect(score).toBeGreaterThan(80); // Should be a high performance score
  });

  test('should handle video interaction', async ({ homePage, page }) => {
    await homePage.waitForLoadingComplete();
    
    // Listen for console messages (video engagement tracking)
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Interact with video
    await homePage.interactWithVideo();
    
    // Wait a moment for console messages
    await page.waitForTimeout(2000);
    
    // Verify engagement tracking was triggered
    const hasHoverLog = consoleLogs.some(log => log.includes('Video engagement: Hover detected'));
    expect(hasHoverLog).toBeTruthy();
  });

  test('should be responsive across different viewport sizes', async ({ homePage, page }) => {
    await homePage.waitForLoadingComplete();
    
    // Test different viewport sizes
    const viewports = [
      TestHelpers.viewports.mobile,
      TestHelpers.viewports.tablet,
      TestHelpers.viewports.desktop
    ];
    
    for (const viewport of viewports) {
      await TestHelpers.setViewport(page, viewport.width, viewport.height);
      
      // Verify essential elements are still visible
      const areElementsVisible = await homePage.verifyResponsiveElements();
      expect(areElementsVisible).toBeTruthy();
      
      // Verify video wrapper adapts to viewport
      const videoWrapper = homePage.videoWrapper;
      expect(await videoWrapper.isVisible()).toBeTruthy();
    }
  });

  test('should have proper loading states', async ({ homePage }) => {
    // Navigate and immediately check for loading overlay
    await homePage.goto('/');
    
    // Loading overlay should be visible initially
    const loadingOverlay = homePage.loadingOverlay;
    const isInitiallyVisible = await loadingOverlay.isVisible();
    
    // Wait for loading to complete
    await homePage.waitForLoadingComplete();
    
    // Loading overlay should be hidden after loading
    const isFinallyHidden = await loadingOverlay.isHidden();
    expect(isFinallyHidden).toBeTruthy();
  });

  test('should have working narration system', async ({ homePage }) => {
    await homePage.waitForLoadingComplete();
    
    // Check if narration overlay exists
    const narrationOverlay = homePage.narrationOverlay;
    expect(await narrationOverlay.isVisible()).toBeTruthy();
    
    // Check if narration text is present
    const narrationText = await narrationOverlay.locator('#narrationText').textContent();
    expect(narrationText).toContain('Designfitout.com');
  });

  test('should load strategic analysis module', async ({ homePage, page }) => {
    await homePage.waitForLoadingComplete();
    
    // Listen for competitor analysis console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Wait for strategic analysis to initialize
    await page.waitForTimeout(3000);
    
    // Verify strategic analysis module is active
    const hasAnalysisLog = consoleLogs.some(log => 
      log.includes('Real-time competitor analysis started') || 
      log.includes('Competitor Analysis Update')
    );
    expect(hasAnalysisLog).toBeTruthy();
  });

  test('should handle page accessibility', async ({ homePage, page }) => {
    await homePage.waitForLoadingComplete();
    
    // Check for alt text on images (if any)
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // Should have alt text
    }
    
    // Check for proper heading structure
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThanOrEqual(1); // Should have at least one H1
    
    // Check for proper iframe title
    const iframe = homePage.videoIframe;
    const title = await iframe.getAttribute('title');
    expect(title).toBeTruthy(); // Should have title attribute
  });
});