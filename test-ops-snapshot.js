#!/usr/bin/env node

/**
 * Test for Ops Snapshot System
 * Validates the KV-backed snapshot endpoint and sync workflow
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Ops Snapshot System...\n');

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${description}`);
      passed++;
      return true;
    } else {
      console.error(`❌ ${description}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

// Test 1: Check snapshot.json.ts endpoint exists
test('Snapshot endpoint file exists', () => {
  return fs.existsSync(path.join(__dirname, 'functions', 'ops', 'snapshot.json.ts'));
});

// Test 2: Check wrangler.toml exists
test('wrangler.toml configuration exists', () => {
  return fs.existsSync(path.join(__dirname, 'wrangler.toml'));
});

// Test 3: Check workflow file exists
test('Ops snapshot sync workflow exists', () => {
  return fs.existsSync(path.join(__dirname, '.github', 'workflows', 'ops-snapshot-sync.yml'));
});

// Test 4: Check template file exists
test('OPS_SNAPSHOT.template.json exists', () => {
  return fs.existsSync(path.join(__dirname, 'milestones', 'OPS_SNAPSHOT.template.json'));
});

// Test 5: Validate snapshot endpoint has GET handler
test('Snapshot endpoint has GET handler', () => {
  const content = fs.readFileSync(path.join(__dirname, 'functions', 'ops', 'snapshot.json.ts'), 'utf8');
  return content.includes('onRequestGet') && 
         content.includes('OPS_KV') &&
         content.includes('get("snapshot")');
});

// Test 6: Validate snapshot endpoint has POST handler with auth
test('Snapshot endpoint has secure POST handler', () => {
  const content = fs.readFileSync(path.join(__dirname, 'functions', 'ops', 'snapshot.json.ts'), 'utf8');
  return content.includes('onRequestPost') &&
         content.includes('MRKETOZ_SHARED_SECRET') &&
         content.includes('authorization');
});

// Test 7: Validate wrangler.toml has OPS_KV binding
test('wrangler.toml has OPS_KV binding', () => {
  const content = fs.readFileSync(path.join(__dirname, 'wrangler.toml'), 'utf8');
  return content.includes('OPS_KV') && 
         content.includes('kv_namespaces');
});

// Test 8: Validate workflow has nightly schedule
test('Workflow has nightly schedule', () => {
  const content = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'ops-snapshot-sync.yml'), 'utf8');
  return content.includes('schedule:') && 
         content.includes('cron:');
});

// Test 9: Validate workflow fetches from KV endpoint
test('Workflow fetches snapshot from endpoint', () => {
  const content = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'ops-snapshot-sync.yml'), 'utf8');
  return content.includes('curl') &&
         content.includes('snapshot.json') &&
         content.includes('ops_snapshot.json');
});

// Test 10: Validate workflow commits to milestones/OPS_SNAPSHOT.json
test('Workflow commits to milestones/OPS_SNAPSHOT.json', () => {
  const content = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'ops-snapshot-sync.yml'), 'utf8');
  return content.includes('milestones/OPS_SNAPSHOT.json') &&
         content.includes('git commit');
});

// Test 11: Validate workflow uploads artifact
test('Workflow uploads artifact', () => {
  const content = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'ops-snapshot-sync.yml'), 'utf8');
  return content.includes('upload-artifact') &&
         content.includes('ops-snapshot');
});

// Test 12: Validate template JSON structure
test('Template JSON has valid structure', () => {
  const content = fs.readFileSync(path.join(__dirname, 'milestones', 'OPS_SNAPSHOT.template.json'), 'utf8');
  const json = JSON.parse(content);
  return json.timestamp &&
         json.status &&
         json.metrics &&
         json.deployments &&
         json.alerts;
});

// Test 13: Validate workflow allows manual trigger
test('Workflow allows manual trigger', () => {
  const content = fs.readFileSync(path.join(__dirname, '.github', 'workflows', 'ops-snapshot-sync.yml'), 'utf8');
  return content.includes('workflow_dispatch');
});

// Test 14: Validate snapshot endpoint follows existing patterns
test('Snapshot endpoint follows existing API patterns', () => {
  const snapshotContent = fs.readFileSync(path.join(__dirname, 'functions', 'ops', 'snapshot.json.ts'), 'utf8');
  const mrketozContent = fs.readFileSync(path.join(__dirname, 'functions', 'api', 'mrketoz.json.ts'), 'utf8');
  
  // Check similar patterns
  const hasPagesFunction = snapshotContent.includes('PagesFunction');
  const hasKVGet = snapshotContent.includes('.get(');
  const hasJsonResponse = snapshotContent.includes('application/json');
  const hasFallback = snapshotContent.includes('fallback');
  
  return hasPagesFunction && hasKVGet && hasJsonResponse && hasFallback;
});

// Test 15: Validate no brand-specific terms in new files
test('No brand-specific terms in new files', () => {
  const files = [
    'functions/ops/snapshot.json.ts',
    '.github/workflows/ops-snapshot-sync.yml',
    'wrangler.toml',
    'milestones/OPS_SNAPSHOT.template.json'
  ];
  
  const bannedTerms = ['firebase', 'ga4', 'gsc'];
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8').toLowerCase();
    for (const term of bannedTerms) {
      if (content.includes(term) && !content.includes('cloudflare')) {
        return false;
      }
    }
  }
  
  return true;
});

console.log(`\nTests completed: ${passed}/${total} passed`);

if (passed === total) {
  console.log('🎉 All tests passed! Ops Snapshot system is properly implemented.');
  process.exit(0);
} else {
  console.error(`\n❌ ${total - passed} test(s) failed.`);
  process.exit(1);
}
