import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  readonly header: Locator;
  readonly videoWrapper: Locator;
  readonly videoIframe: Locator;
  readonly metricsSection: Locator;
  readonly performanceScore: Locator;
  readonly marketPosition: Locator;
  readonly innovationIndex: Locator;
  readonly userEngagement: Locator;
  readonly narrationOverlay: Locator;
  readonly loadingOverlay: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page elements
    this.header = page.locator('header.header');
    this.videoWrapper = page.locator('.video-wrapper');
    this.videoIframe = page.locator('.video-wrapper iframe');
    this.metricsSection = page.locator('.metrics-grid');
    this.performanceScore = page.locator('#performanceScore');
    this.marketPosition = page.locator('#competitorRank');
    this.innovationIndex = page.locator('#innovationIndex');
    this.userEngagement = page.locator('#userEngagement');
    this.narrationOverlay = page.locator('#narrationOverlay');
    this.loadingOverlay = page.locator('#loadingOverlay');
  }

  /**
   * Navigate to home page
   */
  async navigateToHome() {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Wait for loading overlay to disappear
   */
  async waitForLoadingComplete() {
    await this.loadingOverlay.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Check if video is loaded
   */
  async isVideoLoaded(): Promise<boolean> {
    return await this.videoIframe.isVisible();
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return {
      performanceScore: await this.performanceScore.textContent(),
      marketPosition: await this.marketPosition.textContent(),
      innovationIndex: await this.innovationIndex.textContent(),
      userEngagement: await this.userEngagement.textContent(),
    };
  }

  /**
   * Check if narration system is active
   */
  async isNarrationActive(): Promise<boolean> {
    return await this.narrationOverlay.isVisible();
  }

  /**
   * Interact with video (hover to trigger engagement tracking)
   */
  async interactWithVideo() {
    await this.videoWrapper.hover();
    await this.page.waitForTimeout(1000); // Allow time for hover effects
  }

  /**
   * Verify responsive design elements
   */
  async verifyResponsiveElements() {
    // Check that key elements are visible
    const elements = [
      this.header,
      this.videoWrapper,
      this.metricsSection
    ];

    const results = [];
    for (const element of elements) {
      results.push(await element.isVisible());
    }
    
    return results.every(visible => visible);
  }

  /**
   * Get page header text
   */
  async getHeaderText(): Promise<string> {
    return await this.header.locator('h1').textContent() || '';
  }

  /**
   * Get page description text
   */
  async getDescriptionText(): Promise<string> {
    return await this.header.locator('p').textContent() || '';
  }
}