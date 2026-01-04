#!/usr/bin/env node

/**
 * Simple test to verify brand neutrality and configuration validity
 */

const fs = require('fs');
const path = require('path');

// Test configuration template exists and is valid
function testConfigTemplate() {
  console.log('Testing configuration template...');
  
  try {
    const configPath = path.join(__dirname, 'config.template.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('config.template.json not found');
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Verify required sections exist
    const requiredSections = ['cloud', 'analytics', 'search', 'authentication', 'domains'];
    for (const section of requiredSections) {
      if (!config[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }
    
    console.log('✅ Configuration template is valid');
    return true;
  } catch (error) {
    console.error('❌ Configuration template test failed:', error.message);
    return false;
  }
}

// Test that files don't contain hard-coded brand references
function testBrandNeutrality() {
  console.log('Testing brand neutrality...');
  
  const filesToCheck = [
    'README.md',
    'public/ind2x.html',
    'deploy',
    'roots'
  ];
  
  const bannedTerms = ['firebase', 'cloudflare', 'ga4', 'gsc'];
  let foundViolations = false;
  
  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
      
      for (const term of bannedTerms) {
        if (content.includes(term)) {
          console.error(`❌ Found "${term}" in ${file}`);
          foundViolations = true;
        }
      }
    }
  }
  
  if (!foundViolations) {
    console.log('✅ No brand-specific terms found in main files');
    return true;
  }
  
  return false;
}

// Test that essential files exist
function testFileStructure() {
  console.log('Testing file structure...');
  
  const requiredFiles = [
    'README.md',
    'config.template.json',
    'CLOUD_PROVIDERS.md',
    'public/ind2x.html',
    'deploy',
    'roots'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file missing: ${file}`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('✅ All required files present');
    return true;
  }
  
  return false;
}

// Run all tests
function runTests() {
  console.log('Running brand neutrality tests...\n');
  
  const tests = [
    testConfigTemplate,
    testBrandNeutrality,
    testFileStructure
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    if (test()) {
      passedTests++;
    }
    console.log();
  }
  
  console.log(`Tests completed: ${passedTests}/${tests.length} passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Repository is brand-neutral.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testConfigTemplate,
  testBrandNeutrality,
  testFileStructure,
  runTests
};