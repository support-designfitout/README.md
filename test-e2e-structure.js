#!/usr/bin/env node

/**
 * Simple validation test for new Playwright E2E test suite
 * Validates the test structure without running actual browser tests
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Playwright E2E Test Suite Structure...\n');

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${description}`);
      passed++;
    } else {
      console.log(`❌ ${description}`);
    }
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
  }
}

// Test 1: Check test utilities file exists
test('Test utilities file exists', () => {
  return fs.existsSync(path.join(__dirname, 'tests', 'utils.ts'));
});

// Test 2: Check health test file exists
test('Health test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'tests', 'health.spec.ts'));
});

// Test 3: Check performance test file exists
test('Performance test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'tests', 'perf.spec.ts'));
});

// Test 4: Check redirects test file exists
test('Redirects test file exists', () => {
  return fs.existsSync(path.join(__dirname, 'tests', 'redirects.spec.ts'));
});

// Test 5: Check CI workflow exists
test('Smoke E2E workflow exists', () => {
  return fs.existsSync(path.join(__dirname, '.github', 'workflows', 'smoke-e2e.yml'));
});

// Test 6: Check health endpoint exists
test('Health endpoint exists', () => {
  return fs.existsSync(path.join(__dirname, 'public', 'health', 'pages.json'));
});

// Test 7: Validate utils.ts content
test('Utils file has required functions', () => {
  const utilsContent = fs.readFileSync(path.join(__dirname, 'tests', 'utils.ts'), 'utf8');
  return utilsContent.includes('isProd') &&
         utilsContent.includes('logHeader') &&
         utilsContent.includes('warnOnColdCache') &&
         utilsContent.includes('requireCacheHit');
});

// Test 8: Validate health test content
test('Health test has cache enforcement', () => {
  const healthContent = fs.readFileSync(path.join(__dirname, 'tests', 'health.spec.ts'), 'utf8');
  return healthContent.includes('requireCacheHit') &&
         healthContent.includes('warnOnColdCache') &&
         healthContent.includes('HIT');
});

// Test 9: Validate performance test content
test('Performance test has Core Web Vitals', () => {
  const perfContent = fs.readFileSync(path.join(__dirname, 'tests', 'perf.spec.ts'), 'utf8');
  return perfContent.includes('LCP') &&
         perfContent.includes('CLS') &&
         perfContent.includes('Core Web Vitals');
});

// Test 10: Validate CI workflow content
test('CI workflow targets production', () => {
  const workflowContent = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'smoke-e2e.yml'), 'utf8');
  return workflowContent.includes('https://app.fitoutlab.app') &&
         workflowContent.includes('REQUIRE_CACHE_HIT: "true"');
});

// Test 11: Validate health endpoint JSON structure
test('Health endpoint has valid JSON', () => {
  const healthData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'health', 'pages.json'), 'utf8'));
  return healthData.status === 'healthy' &&
         Array.isArray(healthData.pages) &&
         healthData.pages.length > 0;
});

// Test 12: Check TypeScript files have proper imports
test('Test files have Playwright imports', () => {
  const testFiles = ['health.spec.ts', 'perf.spec.ts', 'redirects.spec.ts'];
  return testFiles.every(file => {
    const content = fs.readFileSync(path.join(__dirname, 'tests', file), 'utf8');
    return content.includes("from '@playwright/test'") && content.includes("from './utils'");
  });
});

// Summary
console.log(`\nTests completed: ${passed}/${total} passed`);

if (passed === total) {
  console.log('🎉 All E2E test suite structure validation tests passed!');
  console.log('\n📋 Test Suite Features:');
  console.log('  ✅ Health endpoint testing with cache enforcement');
  console.log('  ✅ Performance testing with Core Web Vitals');
  console.log('  ✅ Redirect validation for production');
  console.log('  ✅ Strict cache policy enforcement (cf-cache-status: HIT)');
  console.log('  ✅ CI workflow targeting production environment');
  console.log('  ✅ Comprehensive logging and reporting utilities');
  console.log('\n🚀 Ready for deployment and CI/CD integration!');
  process.exit(0);
} else {
  console.log('❌ Some validation tests failed. Please review the test suite structure.');
  process.exit(1);
}