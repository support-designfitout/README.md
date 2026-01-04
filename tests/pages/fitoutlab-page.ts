import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class FitOutLabPage extends BasePage {
  readonly pageTitle: Locator;
  readonly domainSection: Locator;
  readonly modulesSection: Locator;
  readonly credentialsSection: Locator;
  readonly deploymentSection: Locator;
  readonly smokeTestsSection: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page elements specific to ind2x.html (FitOutLab page)
    this.pageTitle = page.locator('h1');
    this.domainSection = page.locator('.domain');
    this.modulesSection = page.locator('.modules');
    this.credentialsSection = page.locator('.cred');
    this.deploymentSection = page.locator('.deploy');
    this.smokeTestsSection = page.locator('.smoke');
  }

  /**
   * Navigate to FitOutLab page
   */
  async navigateToFitOutLab() {
    await this.goto('/ind2x.html');
    await this.waitForPageLoad();
  }

  /**
   * Get all section information
   */
  async getAllSectionInfo() {
    return {
      title: await this.pageTitle.textContent(),
      domain: await this.domainSection.textContent(),
      modules: await this.modulesSection.textContent(),
      credentials: await this.credentialsSection.textContent(),
      deployment: await this.deploymentSection.textContent(),
      smokeTests: await this.smokeTestsSection.textContent(),
    };
  }

  /**
   * Verify all sections are present
   */
  async verifyAllSectionsPresent(): Promise<boolean> {
    const sections = [
      this.domainSection,
      this.modulesSection,
      this.credentialsSection,
      this.deploymentSection,
      this.smokeTestsSection
    ];

    const results = [];
    for (const section of sections) {
      results.push(await section.isVisible());
    }
    
    return results.every(visible => visible);
  }

  /**
   * Get domain information
   */
  async getDomainInfo(): Promise<string[]> {
    const domainText = await this.domainSection.textContent() || '';
    // Extract domain information from text
    const domains = [];
    if (domainText.includes('fitoutlab.app')) domains.push('fitoutlab.app');
    if (domainText.includes('www.fitoutlab.app')) domains.push('www.fitoutlab.app');
    return domains;
  }

  /**
   * Get modules list
   */
  async getModulesList(): Promise<string[]> {
    const modulesText = await this.modulesSection.textContent() || '';
    const modules = [];
    if (modulesText.includes('FIX24')) modules.push('FIX24');
    if (modulesText.includes('SpecLab')) modules.push('SpecLab');  
    if (modulesText.includes('SeveNue')) modules.push('SeveNue');
    return modules;
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(): Promise<boolean> {
    const title = await this.pageTitle.textContent();
    return title === 'FitOutLab Capsule';
  }
}