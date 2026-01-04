import { test, expect } from './fixtures/page-fixtures';
import { TestHelpers } from './utils/test-helpers';

test.describe('FitOutLab Page Tests', () => {
  
  test.beforeEach(async ({ fitOutLabPage }) => {
    await fitOutLabPage.navigateToFitOutLab();
  });

  test('should load FitOutLab page with correct title', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Verify page title
    const isCorrectTitle = await fitOutLabPage.verifyPageTitle();
    expect(isCorrectTitle).toBeTruthy();
    
    // Verify page title in browser
    const pageTitle = await fitOutLabPage.getTitle();
    expect(pageTitle).toContain('FitOutLab');
  });

  test('should display all required sections', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Verify all sections are present
    const allSectionsPresent = await fitOutLabPage.verifyAllSectionsPresent();
    expect(allSectionsPresent).toBeTruthy();
    
    // Get all section information
    const sectionInfo = await fitOutLabPage.getAllSectionInfo();
    
    // Verify each section has content
    expect(sectionInfo.title).toBeTruthy();
    expect(sectionInfo.domain).toBeTruthy();
    expect(sectionInfo.modules).toBeTruthy();
    expect(sectionInfo.credentials).toBeTruthy();
    expect(sectionInfo.deployment).toBeTruthy();
    expect(sectionInfo.smokeTests).toBeTruthy();
  });

  test('should display correct domain information', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Get domain information
    const domains = await fitOutLabPage.getDomainInfo();
    
    // Verify expected domains are present
    expect(domains).toContain('fitoutlab.app');
    
    // Verify domain section contains expected text
    const domainSection = fitOutLabPage.domainSection;
    const domainText = await domainSection.textContent();
    expect(domainText).toContain('Primary: fitoutlab.app');
    expect(domainText).toContain('CNAME');
  });

  test('should display correct modules information', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Get modules list
    const modules = await fitOutLabPage.getModulesList();
    
    // Verify expected modules are present
    expect(modules).toContain('FIX24');
    expect(modules).toContain('SpecLab');
    expect(modules).toContain('SeveNue');
    
    // Verify modules section contains descriptions
    const modulesSection = fitOutLabPage.modulesSection;
    const modulesText = await modulesSection.textContent();
    expect(modulesText).toContain('Diagnostic flows');
    expect(modulesText).toContain('Spec-driven schema');
    expect(modulesText).toContain('Dispatch publishing');
  });

  test('should display credential hygiene information', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Verify credentials section content
    const credentialsSection = fitOutLabPage.credentialsSection;
    const credentialsText = await credentialsSection.textContent();
    
    expect(credentialsText).toContain('Secrets vault');
    expect(credentialsText).toContain('Audit logs');
    expect(credentialsText).toContain('Cloud CLI authenticated');
  });

  test('should display deployment information', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Verify deployment section content
    const deploymentSection = fitOutLabPage.deploymentSection;
    const deploymentText = await deploymentSection.textContent();
    
    expect(deploymentText).toContain('Cloud Hosting');
    expect(deploymentText).toContain('Serverless Functions');
    expect(deploymentText).toContain('Global clones');
    
    // Verify country flags/codes are present
    const hasGlobalClones = deploymentText.includes('🇸🇦') || 
                           deploymentText.includes('🇿🇦') || 
                           deploymentText.includes('🇵🇭');
    expect(hasGlobalClones).toBeTruthy();
  });

  test('should display smoke tests information', async ({ fitOutLabPage }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Verify smoke tests section content
    const smokeTestsSection = fitOutLabPage.smokeTestsSection;
    const smokeTestsText = await smokeTestsSection.textContent();
    
    expect(smokeTestsText).toContain('DNS');
    expect(smokeTestsText).toContain('fitoutlab.app');
    expect(smokeTestsText).toContain('designfitout.com');
    expect(smokeTestsText).toContain('Search indexing');
    expect(smokeTestsText).toContain('Analytics');
  });

  test('should be responsive across different viewport sizes', async ({ fitOutLabPage, page }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Test different viewport sizes
    const viewports = [
      TestHelpers.viewports.mobile,
      TestHelpers.viewports.tablet,
      TestHelpers.viewports.desktop
    ];
    
    for (const viewport of viewports) {
      await TestHelpers.setViewport(page, viewport.width, viewport.height);
      
      // Verify all sections are still visible and properly arranged
      const allSectionsPresent = await fitOutLabPage.verifyAllSectionsPresent();
      expect(allSectionsPresent).toBeTruthy();
      
      // Verify page title is still visible
      const titleVisible = await fitOutLabPage.pageTitle.isVisible();
      expect(titleVisible).toBeTruthy();
    }
  });

  test('should have proper CSS styling', async ({ fitOutLabPage, page }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Check if container has proper styling
    const container = page.locator('.container');
    if (await container.count() > 0) {
      const backgroundColor = await TestHelpers.getComputedStyle(page, '.container', 'background-color');
      expect(backgroundColor).toBeTruthy();
    }
    
    // Check if sections have proper list styling
    const listItems = page.locator('ul li');
    if (await listItems.count() > 0) {
      const firstListItem = listItems.first();
      const display = await TestHelpers.getComputedStyle(page, 'ul li', 'display');
      expect(display).toBeTruthy();
    }
  });

  test('should have semantic HTML structure', async ({ fitOutLabPage, page }) => {
    await fitOutLabPage.waitForPageLoad();
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one H1
    
    // Check for proper list structures
    const unorderedLists = await page.locator('ul').count();
    expect(unorderedLists).toBeGreaterThan(0); // Should have lists for content
    
    // Check for proper semantic elements
    const strongElements = await page.locator('strong').count();
    expect(strongElements).toBeGreaterThan(0); // Should have emphasized text
  });

  test('should load quickly and efficiently', async ({ fitOutLabPage, page }) => {
    // Measure page load time
    const startTime = Date.now();
    
    await fitOutLabPage.navigateToFitOutLab();
    await fitOutLabPage.waitForPageLoad();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time (adjust as needed)
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    // Verify no JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(2000); // Wait for any potential errors
    expect(errors.length).toBe(0);
  });
});