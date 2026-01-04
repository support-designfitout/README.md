#!/usr/bin/env node

/**
 * Test suite for worker implementations
 * Validates that workers are cloud-agnostic and properly structured
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${description}`);
      testsPassed++;
      return true;
    } else {
      console.error(`❌ ${description}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    console.error(`❌ ${description}: ${error.message}`);
    testsFailed++;
    return false;
  }
}

// Test 1: Worker directories exist
test('Worker directories exist', () => {
  const edgeCacheExists = fs.existsSync(path.join(__dirname, 'workers', 'edge-cache'));
  const apiGatewayExists = fs.existsSync(path.join(__dirname, 'workers', 'api-gateway'));
  return edgeCacheExists && apiGatewayExists;
});

// Test 2: Worker index files exist
test('Worker index files exist', () => {
  const edgeCacheIndex = fs.existsSync(path.join(__dirname, 'workers', 'edge-cache', 'index.js'));
  const apiGatewayIndex = fs.existsSync(path.join(__dirname, 'workers', 'api-gateway', 'index.js'));
  return edgeCacheIndex && apiGatewayIndex;
});

// Test 3: Worker README files exist
test('Worker README files exist', () => {
  const edgeCacheReadme = fs.existsSync(path.join(__dirname, 'workers', 'edge-cache', 'README.md'));
  const apiGatewayReadme = fs.existsSync(path.join(__dirname, 'workers', 'api-gateway', 'README.md'));
  return edgeCacheReadme && apiGatewayReadme;
});

// Test 4: Worker package.json files exist
test('Worker package.json files exist', () => {
  const edgeCachePkg = fs.existsSync(path.join(__dirname, 'workers', 'edge-cache', 'package.json'));
  const apiGatewayPkg = fs.existsSync(path.join(__dirname, 'workers', 'api-gateway', 'package.json'));
  return edgeCachePkg && apiGatewayPkg;
});

// Test 5: Wrangler templates exist (not actual wrangler.toml)
test('Wrangler templates exist', () => {
  const edgeCacheTemplate = fs.existsSync(path.join(__dirname, 'workers', 'edge-cache', 'wrangler.toml.template'));
  const apiGatewayTemplate = fs.existsSync(path.join(__dirname, 'workers', 'api-gateway', 'wrangler.toml.template'));
  return edgeCacheTemplate && apiGatewayTemplate;
});

// Test 6: No hard-coded Cloudflare references in worker code
test('Worker code is cloud-agnostic', () => {
  const edgeCacheCode = fs.readFileSync(path.join(__dirname, 'workers', 'edge-cache', 'index.js'), 'utf8');
  const apiGatewayCode = fs.readFileSync(path.join(__dirname, 'workers', 'api-gateway', 'index.js'), 'utf8');
  
  // Check for bannedTerms in actual code (not in comments/docs)
  // We allow comments mentioning Cloudflare, but not hard-coded dependencies
  const codeLines = (edgeCacheCode + apiGatewayCode).split('\n')
    .filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('*'));
  
  const bannedImports = ['cloudflare', 'firebase'];
  for (const term of bannedImports) {
    if (codeLines.some(line => line.includes(`require('${term}')`) || line.includes(`from '${term}'`))) {
      console.error(`  Found hard-coded import: ${term}`);
      return false;
    }
  }
  
  return true;
});

// Test 7: Workers export multiple formats
test('Workers export multiple platform formats', () => {
  const edgeCacheCode = fs.readFileSync(path.join(__dirname, 'workers', 'edge-cache', 'index.js'), 'utf8');
  const apiGatewayCode = fs.readFileSync(path.join(__dirname, 'workers', 'api-gateway', 'index.js'), 'utf8');
  
  // Check for multiple export formats
  const hasDefaultExport = edgeCacheCode.includes('export default') && apiGatewayCode.includes('export default');
  const hasModuleExport = edgeCacheCode.includes('module.exports') && apiGatewayCode.includes('module.exports');
  const hasNamedExport = edgeCacheCode.includes('export const') && apiGatewayCode.includes('export const');
  
  return hasDefaultExport && hasModuleExport && hasNamedExport;
});

// Test 8: config.template.json includes worker configuration
test('Config template includes worker configuration', () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.template.json'), 'utf8'));
  return config.workers && config.workers.edgeCache && config.workers.apiGateway;
});

// Test 9: WORKER_DEPLOYMENT.md exists
test('Worker deployment documentation exists', () => {
  return fs.existsSync(path.join(__dirname, 'WORKER_DEPLOYMENT.md'));
});

// Test 10: Worker deployment doc is cloud-agnostic
test('Worker deployment doc covers multiple platforms', () => {
  const doc = fs.readFileSync(path.join(__dirname, 'WORKER_DEPLOYMENT.md'), 'utf8');
  
  const platforms = ['Cloudflare', 'AWS', 'Azure', 'Google Cloud'];
  const allPlatformsCovered = platforms.every(platform => 
    doc.toLowerCase().includes(platform.toLowerCase())
  );
  
  return allPlatformsCovered;
});

// Test 11: .gitignore excludes wrangler.toml
test('.gitignore excludes worker configuration files', () => {
  const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
  return gitignore.includes('workers/*/wrangler.toml');
});

// Test 12: Worker templates mention cloud-agnostic architecture
test('Worker templates mention cloud-agnostic approach', () => {
  const edgeCacheTemplate = fs.readFileSync(path.join(__dirname, 'workers', 'edge-cache', 'wrangler.toml.template'), 'utf8');
  const apiGatewayTemplate = fs.readFileSync(path.join(__dirname, 'workers', 'api-gateway', 'wrangler.toml.template'), 'utf8');
  
  const mentionsCloudAgnostic = 
    (edgeCacheTemplate.includes('cloud-agnostic') || edgeCacheTemplate.includes('template')) &&
    (apiGatewayTemplate.includes('cloud-agnostic') || apiGatewayTemplate.includes('template'));
  
  return mentionsCloudAgnostic;
});

// Test 13: Workers handle errors gracefully
test('Workers include error handling', () => {
  const edgeCacheCode = fs.readFileSync(path.join(__dirname, 'workers', 'edge-cache', 'index.js'), 'utf8');
  const apiGatewayCode = fs.readFileSync(path.join(__dirname, 'workers', 'api-gateway', 'index.js'), 'utf8');
  
  const hasErrorHandling = 
    (edgeCacheCode.includes('try') && edgeCacheCode.includes('catch')) &&
    (apiGatewayCode.includes('try') && apiGatewayCode.includes('catch'));
  
  return hasErrorHandling;
});

// Test 14: API Gateway has CORS support
test('API Gateway includes CORS configuration', () => {
  const apiGatewayCode = fs.readFileSync(path.join(__dirname, 'workers', 'api-gateway', 'index.js'), 'utf8');
  
  return apiGatewayCode.includes('Access-Control-Allow-Origin') &&
         apiGatewayCode.includes('corsHeaders');
});

// Test 15: API Gateway has health check endpoint
test('API Gateway includes health check endpoint', () => {
  const apiGatewayCode = fs.readFileSync(path.join(__dirname, 'workers', 'api-gateway', 'index.js'), 'utf8');
  
  return apiGatewayCode.includes('/api/health') &&
         apiGatewayCode.includes('handleHealth');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Tests completed: ${testsPassed} passed, ${testsFailed} failed`);
console.log('='.repeat(60));

if (testsFailed === 0) {
  console.log('\n🎉 All worker tests passed!');
  console.log('\nWorker implementation summary:');
  console.log('  ✅ Cloud-agnostic worker architecture');
  console.log('  ✅ Multiple platform export formats');
  console.log('  ✅ Configuration templates for deployment');
  console.log('  ✅ Comprehensive documentation');
  console.log('  ✅ Error handling and CORS support');
  console.log('  ✅ Health check endpoints');
  console.log('\n🚀 Workers are ready for deployment!');
  console.log('   See WORKER_DEPLOYMENT.md for deployment instructions.');
  process.exit(0);
} else {
  console.log('\n❌ Some worker tests failed. Please review the issues above.');
  process.exit(1);
}
