import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { FitOutLabPage } from '../pages/fitoutlab-page';

// Extend the base test with page object fixtures
type PageFixtures = {
  homePage: HomePage;
  fitOutLabPage: FitOutLabPage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  fitOutLabPage: async ({ page }, use) => {
    const fitOutLabPage = new FitOutLabPage(page);
    await use(fitOutLabPage);
  },
});

export { expect } from '@playwright/test';