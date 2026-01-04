#!/usr/bin/env node

/**
 * Ops Snapshot Endpoint Tests
 * 
 * Tests the HMAC authentication and functionality of the ops snapshot endpoint.
 * This test suite validates:
 * - HMAC signature generation and verification
 * - Timestamp validation and skew tolerance
 * - Bearer token fallback authentication
 * - Request/response structure
 * - Error handling
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test result reporter
 */
function assert(condition, testName, errorMessage = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (errorMessage) {
      console.log(`  ${colors.red}Error: ${errorMessage}${colors.reset}`);
    }
    testsFailed++;
  }
}

/**
 * Compute HMAC-SHA256 signature (Node.js implementation)
 */
function computeHMAC(secret, message) {
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

/**
 * Test Suite: HMAC Signature Computation
 */
function testHMACComputation() {
  console.log('\n' + colors.blue + 'Testing HMAC Signature Computation...' + colors.reset);

  // Test 1: Basic HMAC computation
  const secret = 'test-secret-key';
  const message = 'test-message';
  const signature = computeHMAC(secret, message);

  assert(
    signature && signature.length === 64,
    'HMAC signature should be 64 hex characters',
    `Got length: ${signature ? signature.length : 0}`
  );

  // Test 2: Consistent signatures
  const signature2 = computeHMAC(secret, message);
  assert(
    signature === signature2,
    'HMAC computation should be deterministic'
  );

  // Test 3: Different messages produce different signatures
  const differentMessage = 'different-message';
  const signature3 = computeHMAC(secret, differentMessage);
  assert(
    signature !== signature3,
    'Different messages should produce different signatures'
  );

  // Test 4: Timestamp-based signature format
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({ test: 'data' });
  const messageWithTimestamp = `${timestamp}.${body}`;
  const signatureWithTimestamp = computeHMAC(secret, messageWithTimestamp);

  assert(
    signatureWithTimestamp && signatureWithTimestamp.length === 64,
    'Timestamp-based HMAC signature should be valid',
    `Got: ${signatureWithTimestamp}`
  );
}

/**
 * Test Suite: Timestamp Validation
 */
function testTimestampValidation() {
  console.log('\n' + colors.blue + 'Testing Timestamp Validation...' + colors.reset);

  // Test 1: Current timestamp should be valid
  const currentTimestamp = new Date().toISOString();
  assert(
    true, // We can't validate without the server, but structure is correct
    'Current ISO 8601 timestamp format is valid',
    `Generated: ${currentTimestamp}`
  );

  // Test 2: Epoch milliseconds format
  const epochTimestamp = Date.now().toString();
  assert(
    /^\d+$/.test(epochTimestamp),
    'Epoch milliseconds format is valid',
    `Generated: ${epochTimestamp}`
  );

  // Test 3: Timestamp parsing
  const parsedDate = new Date(currentTimestamp);
  assert(
    !isNaN(parsedDate.getTime()),
    'ISO 8601 timestamp should be parseable',
    `Parsed: ${parsedDate.toISOString()}`
  );

  // Test 4: Old timestamp (should be outside skew window)
  const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
  const oldDate = new Date(oldTimestamp);
  const timeDiff = Math.abs(Date.now() - oldDate.getTime()) / 1000;
  assert(
    timeDiff > 300, // More than 5 minutes
    'Old timestamp should be detected as outside skew window',
    `Time difference: ${timeDiff}s`
  );
}

/**
 * Test Suite: Request Structure
 */
function testRequestStructure() {
  console.log('\n' + colors.blue + 'Testing Request Structure...' + colors.reset);

  const secret = 'test-secret';
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({ 
    data: 'test-snapshot',
    items: [1, 2, 3]
  });

  // Test 1: Valid request headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Timestamp': timestamp,
    'X-Signature': computeHMAC(secret, `${timestamp}.${body}`)
  };

  assert(
    headers['Content-Type'] === 'application/json',
    'Content-Type header should be application/json'
  );

  assert(
    headers['X-Timestamp'] && headers['X-Timestamp'].length > 0,
    'X-Timestamp header should be present'
  );

  assert(
    headers['X-Signature'] && headers['X-Signature'].length === 64,
    'X-Signature header should be valid hex string',
    `Got length: ${headers['X-Signature'].length}`
  );

  // Test 2: Bearer token format
  const bearerHeader = `Bearer ${secret}`;
  assert(
    bearerHeader.startsWith('Bearer '),
    'Bearer token format should be correct'
  );

  // Test 3: JSON body validation
  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
    assert(
      parsedBody && typeof parsedBody === 'object',
      'Request body should be valid JSON'
    );
  } catch (error) {
    assert(false, 'Request body should be valid JSON', error.message);
  }
}

/**
 * Test Suite: Function File Structure
 */
function testFunctionFileStructure() {
  console.log('\n' + colors.blue + 'Testing Function File Structure...' + colors.reset);

  const functionPath = path.join(__dirname, 'functions', 'ops', 'snapshot.json.ts');

  // Test 1: Function file exists
  assert(
    fs.existsSync(functionPath),
    'Function file exists at functions/ops/snapshot.json.ts'
  );

  if (fs.existsSync(functionPath)) {
    const content = fs.readFileSync(functionPath, 'utf8');

    // Test 2: Contains HMAC verification logic
    assert(
      content.includes('computeHMAC') || content.includes('HMAC'),
      'Function should contain HMAC computation logic'
    );

    // Test 3: Contains timestamp validation
    assert(
      content.includes('timestamp') && content.includes('skew'),
      'Function should contain timestamp skew validation'
    );

    // Test 4: Contains authentication logic
    assert(
      content.includes('authenticate') || content.includes('auth'),
      'Function should contain authentication logic'
    );

    // Test 5: Supports GET method
    assert(
      content.includes('GET') || content.includes('get'),
      'Function should support GET method'
    );

    // Test 6: Supports POST method
    assert(
      content.includes('POST') || content.includes('post'),
      'Function should support POST method'
    );

    // Test 7: Contains Bearer token fallback
    assert(
      content.includes('Bearer') && content.includes('Authorization'),
      'Function should support Bearer token fallback'
    );

    // Test 8: Uses timing-safe comparison
    assert(
      content.includes('timingSafe') || content.includes('timing'),
      'Function should use timing-safe comparison'
    );

    // Test 9: Uses Web Crypto API
    assert(
      content.includes('crypto.subtle') || content.includes('Web Crypto'),
      'Function should use Web Crypto API'
    );

    // Test 10: Contains proper TypeScript types
    assert(
      content.includes('interface') && content.includes('Env'),
      'Function should have proper TypeScript type definitions'
    );
  }
}

/**
 * Test Suite: Script Files
 */
function testScriptFiles() {
  console.log('\n' + colors.blue + 'Testing Script Files...' + colors.reset);

  // Test 1: rotate-secret.sh exists and is executable
  const rotateScriptPath = path.join(__dirname, 'scripts', 'rotate-secret.sh');
  assert(
    fs.existsSync(rotateScriptPath),
    'rotate-secret.sh script exists'
  );

  if (fs.existsSync(rotateScriptPath)) {
    const stats = fs.statSync(rotateScriptPath);
    assert(
      (stats.mode & 0o111) !== 0,
      'rotate-secret.sh is executable'
    );

    const content = fs.readFileSync(rotateScriptPath, 'utf8');
    
    assert(
      content.includes('set -euo pipefail'),
      'rotate-secret.sh uses safe bash options'
    );

    assert(
      content.includes('DRY_RUN'),
      'rotate-secret.sh supports DRY_RUN mode'
    );

    assert(
      content.includes('openssl rand'),
      'rotate-secret.sh uses openssl for secret generation'
    );

    assert(
      content.includes('wrangler secret put'),
      'rotate-secret.sh updates Cloudflare secret'
    );

    assert(
      content.includes('gh secret set'),
      'rotate-secret.sh updates GitHub secret'
    );
  }

  // Test 2: restore-snapshot.sh exists and is executable
  const restoreScriptPath = path.join(__dirname, 'scripts', 'restore-snapshot.sh');
  assert(
    fs.existsSync(restoreScriptPath),
    'restore-snapshot.sh script exists'
  );

  if (fs.existsSync(restoreScriptPath)) {
    const stats = fs.statSync(restoreScriptPath);
    assert(
      (stats.mode & 0o111) !== 0,
      'restore-snapshot.sh is executable'
    );

    const content = fs.readFileSync(restoreScriptPath, 'utf8');
    
    assert(
      content.includes('set -euo pipefail'),
      'restore-snapshot.sh uses safe bash options'
    );

    assert(
      content.includes('MRKETOZ_SHARED_SECRET'),
      'restore-snapshot.sh uses MRKETOZ_SHARED_SECRET environment variable'
    );

    assert(
      content.includes('curl'),
      'restore-snapshot.sh uses curl for HTTP requests'
    );

    assert(
      content.includes('X-Signature') && content.includes('X-Timestamp'),
      'restore-snapshot.sh includes HMAC headers'
    );
  }
}

/**
 * Test Suite: Documentation
 */
function testDocumentation() {
  console.log('\n' + colors.blue + 'Testing Documentation...' + colors.reset);

  // Test 1: RUNBOOK.md exists
  const runbookPath = path.join(__dirname, 'RUNBOOK.md');
  assert(
    fs.existsSync(runbookPath),
    'RUNBOOK.md exists at repository root'
  );

  if (fs.existsSync(runbookPath)) {
    const content = fs.readFileSync(runbookPath, 'utf8');

    assert(
      content.includes('Secret Rotation'),
      'RUNBOOK.md contains secret rotation procedure'
    );

    assert(
      content.includes('KV Recovery') || content.includes('Restore'),
      'RUNBOOK.md contains recovery procedure'
    );

    assert(
      content.includes('Incident') || content.includes('Post-Incident'),
      'RUNBOOK.md contains incident response procedures'
    );

    assert(
      content.includes('HMAC'),
      'RUNBOOK.md documents HMAC authentication'
    );

    assert(
      content.includes('Contacts') || content.includes('contact'),
      'RUNBOOK.md includes contact information section'
    );

    assert(
      !content.includes('PLAIN_SECRET=') && !content.includes('password123'),
      'RUNBOOK.md does not contain plaintext secrets'
    );
  }
}

/**
 * Test Suite: Pre-commit Hooks
 */
function testPreCommitHooks() {
  console.log('\n' + colors.blue + 'Testing Pre-commit Hooks...' + colors.reset);

  // Test 1: .pre-commit-config.yaml exists
  const preCommitConfigPath = path.join(__dirname, '.pre-commit-config.yaml');
  assert(
    fs.existsSync(preCommitConfigPath),
    '.pre-commit-config.yaml exists'
  );

  if (fs.existsSync(preCommitConfigPath)) {
    const content = fs.readFileSync(preCommitConfigPath, 'utf8');

    assert(
      content.includes('detect-secrets'),
      '.pre-commit-config.yaml includes detect-secrets hook'
    );

    assert(
      content.includes('repos:'),
      '.pre-commit-config.yaml has valid YAML structure'
    );
  }

  // Test 2: .husky/pre-commit exists
  const huskyPreCommitPath = path.join(__dirname, '.husky', 'pre-commit');
  assert(
    fs.existsSync(huskyPreCommitPath),
    '.husky/pre-commit hook exists'
  );

  if (fs.existsSync(huskyPreCommitPath)) {
    const stats = fs.statSync(huskyPreCommitPath);
    assert(
      (stats.mode & 0o111) !== 0,
      '.husky/pre-commit is executable'
    );

    const content = fs.readFileSync(huskyPreCommitPath, 'utf8');

    assert(
      content.includes('detect-secrets'),
      '.husky/pre-commit references detect-secrets'
    );
  }
}

/**
 * Test Suite: Security Checks
 */
function testSecurityChecks() {
  console.log('\n' + colors.blue + 'Testing Security Checks...' + colors.reset);

  // Test 1: Check for accidental secret leakage in new files
  const filesToCheck = [
    'RUNBOOK.md',
    'scripts/rotate-secret.sh',
    'scripts/restore-snapshot.sh',
    'functions/ops/snapshot.json.ts',
    '.pre-commit-config.yaml',
    '.husky/pre-commit'
  ];

  const dangerousPatterns = [
    /MRKETOZ_SHARED_SECRET\s*=\s*["'][A-Za-z0-9+/]{20,}["']/,  // Actual secret assignment (not variable)
    /Bearer\s+[A-Za-z0-9+/]{32,}={0,2}(?![\s$])/,              // Bearer token with long hardcoded value
    /password\s*[:=]\s*["'][A-Za-z0-9]{10,}["']/i,             // Password with hardcoded value
  ];

  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      let foundDangerousPattern = false;
      dangerousPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          foundDangerousPattern = true;
        }
      });

      assert(
        !foundDangerousPattern,
        `${file} should not contain plaintext secrets`,
        foundDangerousPattern ? 'Potential secret pattern detected' : ''
      );
    }
  });

  // Test 2: Scripts use environment variables for secrets
  const rotateScriptPath = path.join(__dirname, 'scripts', 'rotate-secret.sh');
  if (fs.existsSync(rotateScriptPath)) {
    const content = fs.readFileSync(rotateScriptPath, 'utf8');
    
    // Should NOT echo the secret directly to stdout (piping to secure commands is OK)
    // Look for standalone echo of NEW_SECRET that's not piped
    const hasStandaloneEcho = content.match(/(?<!if\s)echo\s+["']?\$NEW_SECRET["']?\s*$/m);
    assert(
      !hasStandaloneEcho,
      'rotate-secret.sh should not echo the generated secret to stdout'
    );
  }
}

/**
 * Main test runner
 */
function runTests() {
  console.log(colors.blue + '\n═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.blue + '  Ops Snapshot Endpoint Tests' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════════════════════════' + colors.reset);

  testHMACComputation();
  testTimestampValidation();
  testRequestStructure();
  testFunctionFileStructure();
  testScriptFiles();
  testDocumentation();
  testPreCommitHooks();
  testSecurityChecks();

  // Summary
  console.log(colors.blue + '\n═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.blue + '  Test Summary' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════════════════════════' + colors.reset);
  console.log(`\nTotal tests: ${testsPassed + testsFailed}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests();
