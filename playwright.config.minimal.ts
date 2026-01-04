import { defineConfig } from '@playwright/test';

/**
 * Minimal Playwright configuration for environments without browsers installed
 * Use this for configuration validation and basic structure testing
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/basic-validation.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'dot',
  use: {
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  // Only test configuration validation without browser launch
  projects: [
    {
      name: 'validation',
      testMatch: '**/basic-validation.spec.ts',
    },
  ],
  // Skip global setup/teardown for minimal config
});