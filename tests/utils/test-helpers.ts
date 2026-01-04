import { Page } from '@playwright/test';

/**
 * Utility functions for common test operations
 */
export class TestHelpers {
  
  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for specific number of network requests to complete
   */
  static async waitForRequests(page: Page, count: number, timeout: number = 10000) {
    let requestCount = 0;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${count} requests`));
      }, timeout);

      page.on('response', () => {
        requestCount++;
        if (requestCount >= count) {
          clearTimeout(timer);
          resolve(requestCount);
        }
      });
    });
  }

  /**
   * Simulate viewport changes for responsive testing
   */
  static async setViewport(page: Page, width: number, height: number) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(500); // Allow time for responsive changes
  }

  /**
   * Common viewport sizes for testing
   */
  static viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
    smallDesktop: { width: 1366, height: 768 },
  };

  /**
   * Check if element is in viewport
   */
  static async isElementInViewport(page: Page, selector: string): Promise<boolean> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }, selector);
  }

  /**
   * Get computed style property
   */
  static async getComputedStyle(page: Page, selector: string, property: string): Promise<string> {
    return await page.evaluate(
      ({ sel, prop }) => {
        const element = document.querySelector(sel);
        if (!element) return '';
        return window.getComputedStyle(element).getPropertyValue(prop);
      },
      { sel: selector, prop: property }
    );
  }

  /**
   * Generate test data
   */
  static generateTestData() {
    return {
      timestamp: Date.now(),
      randomString: Math.random().toString(36).substring(7),
      email: `test${Date.now()}@example.com`,
    };
  }

  /**
   * Wait for animation to complete
   */
  static async waitForAnimation(page: Page, selector: string, timeout: number = 5000) {
    await page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel);
        if (!element) return true;
        
        const computedStyle = window.getComputedStyle(element);
        const animationName = computedStyle.animationName;
        const transitionProperty = computedStyle.transitionProperty;
        
        return animationName === 'none' && transitionProperty === 'none';
      },
      selector,
      { timeout }
    );
  }
}