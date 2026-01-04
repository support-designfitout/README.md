import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  // Perform any global cleanup tasks here
  // For example: database cleanup, cache clearing, temp file removal, etc.
  
  console.log('✅ Global test teardown completed');
}

export default globalTeardown;