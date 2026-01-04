/**
 * Test utilities for Playwright E2E and performance testing
 * Provides helper functions for environment detection, logging, and cache analysis
 */

import { Response } from '@playwright/test';

/**
 * Environment detection helper
 * @param baseURL - Base URL being tested
 * @returns true if testing against production environment
 */
export function isProd(baseURL?: string): boolean {
  const url = baseURL || process.env.BASE_URL || '';
  return url.includes('fitoutlab.app') && !url.includes('staging.') && !url.includes('dev.');
}

/**
 * Log formatted header for test sections
 * @param message - Header message to log
 */
export function logHeader(message: string): void {
  console.log(`\n🧪 ${message}`);
  console.log('='.repeat(50));
}

/**
 * Log cache-related headers from response
 * @param response - Playwright Response object
 */
export function logCacheHeaders(response: Response): void {
  const cacheHeaders = {
    'cf-cache-status': response.headers()['cf-cache-status'],
    'age': response.headers()['age'],
    'cache-control': response.headers()['cache-control'],
    'expires': response.headers()['expires'],
    'last-modified': response.headers()['last-modified'],
    'etag': response.headers()['etag']
  };

  console.log('📊 Cache Headers:');
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    if (value) {
      console.log(`  ${key}: ${value}`);
    }
  });
}

/**
 * Warn if cache is cold and return cache status
 * @param response - Playwright Response object
 * @returns object with cache status information
 */
export function warnOnColdCache(response: Response): { 
  isCacheHit: boolean; 
  cacheStatus: string | undefined; 
  age: number | undefined 
} {
  const cacheStatus = response.headers()['cf-cache-status'];
  const ageHeader = response.headers()['age'];
  const age = ageHeader ? parseInt(ageHeader, 10) : undefined;
  const isCacheHit = cacheStatus === 'HIT';

  if (!isCacheHit) {
    console.warn(`⚠️  Cache status: ${cacheStatus || 'unknown'} (expected: HIT)`);
  }

  if (age !== undefined && age < 1) {
    console.warn(`⚠️  Cache age: ${age}s (expected: ≥1s)`);
  }

  return { isCacheHit, cacheStatus, age };
}

/**
 * Log cache age and warn if too young
 * @param response - Playwright Response object
 * @param minAge - Minimum expected age in seconds (default: 1)
 */
export function logAndWarnOnAge(response: Response, minAge: number = 1): void {
  const ageHeader = response.headers()['age'];
  const age = ageHeader ? parseInt(ageHeader, 10) : undefined;

  if (age !== undefined) {
    console.log(`⏱️  Cache age: ${age} seconds`);
    if (age < minAge) {
      console.warn(`⚠️  Cache age ${age}s is below minimum expected age of ${minAge}s`);
    }
  } else {
    console.warn('⚠️  No cache age header found');
  }
}

/**
 * Check if cache enforcement is required
 * @returns true if REQUIRE_CACHE_HIT environment variable is set to "true"
 */
export function requireCacheHit(): boolean {
  return process.env.REQUIRE_CACHE_HIT === 'true';
}

/**
 * Get expected base URL for testing
 * @returns base URL from environment or default
 */
export function getBaseURL(): string {
  return process.env.BASE_URL || 'http://localhost:3000';
}