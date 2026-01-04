#!/usr/bin/env node

/**
 * Enhanced test suite for brand neutrality, configuration validity, and dual domain support
 */

const fs = require('fs');
const path = require('path');

// Import the new configuration manager
const ConfigurationManager = require('./config-manager.js');

// Test configuration template exists and is valid
function testConfigTemplate() {
  console.log('Testing configuration template...');
  
  try {
    const configPath = path.join(__dirname, 'config.template.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('config.template.json not found');
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Verify required sections exist (updated with new sections)
    const requiredSections = ['cloud', 'analytics', 'search', 'authentication', 'domains', 'environment', 'deployment'];
    for (const section of requiredSections) {
      if (!config[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }
    
    // Validate domains configuration structure
    if (!config.domains.primary || !config.domains.secondary) {
      throw new Error('Both primary and secondary domains must be specified');
    }
    
    // Validate environment configuration
    if (!config.environment.variables || !config.environment.validation) {
      throw new Error('Environment configuration must include variables and validation sections');
    }
    
    console.log('✅ Configuration template is valid');
    return true;
  } catch (error) {
    console.error('❌ Configuration template test failed:', error.message);
    return false;
  }
}

// Test dual domain configuration and URL validation
function testDualDomainConfiguration() {
  console.log('Testing dual domain configuration...');
  
  try {
    const manager = new ConfigurationManager();
    const template = manager.loadTemplate();
    
    // Validate domain configuration
    const domainValidation = manager.validateDomainConfig(template.domains);
    
    if (!domainValidation.isValid) {
      throw new Error(`Domain validation failed: ${domainValidation.errors.join(', ')}`);
    }
    
    // Test environment-specific configurations
    const environments = ['development', 'staging', 'production'];
    for (const env of environments) {
      const envConfig = manager.getEnvironmentConfig(env, template);
      const envValidation = manager.validateConfiguration(envConfig);
      
      if (!envValidation.isValid) {
        throw new Error(`${env} environment validation failed: ${envValidation.errors.join(', ')}`);
      }
    }
    
    // Test domain optimization
    const optimized = manager.optimizeDomainConfig(template);
    if (!optimized.domainOptimizations) {
      throw new Error('Domain optimization failed to generate optimizations');
    }
    
    console.log('✅ Dual domain configuration is valid');
    if (domainValidation.warnings.length > 0) {
      console.log('⚠️ Domain warnings:', domainValidation.warnings.join(', '));
    }
    return true;
  } catch (error) {
    console.error('❌ Dual domain configuration test failed:', error.message);
    return false;
  }
}

// Test environment variable handling
function testEnvironmentVariables() {
  console.log('Testing environment variable handling...');
  
  try {
    const manager = new ConfigurationManager();
    const template = manager.loadTemplate();
    
    // Check that environment variables section exists
    if (!template.environment || !template.environment.variables) {
      throw new Error('Environment variables section missing from template');
    }
    
    // Test each environment configuration
    const environments = ['development', 'staging', 'production'];
    for (const env of environments) {
      const config = manager.getEnvironmentConfig(env, template);
      
      // Verify environment metadata is added
      if (!config.environment || !config.environment.name) {
        throw new Error(`Environment metadata missing for ${env}`);
      }
      
      // Verify domain prefix is applied correctly for non-production environments
      if (env !== 'production') {
        if (!config.domains.primary.startsWith(env + '.')) {
          throw new Error(`Environment prefix not applied to primary domain for ${env} - got ${config.domains.primary}`);
        }
        if (!config.domains.secondary.startsWith(env + '.')) {
          throw new Error(`Environment prefix not applied to secondary domain for ${env} - got ${config.domains.secondary}`);
        }
      }
    }
    
    console.log('✅ Environment variable handling is working correctly');
    return true;
  } catch (error) {
    console.error('❌ Environment variable test failed:', error.message);
    return false;
  }
}

// Test URL validation functionality
function testUrlValidation() {
  console.log('Testing URL validation...');
  
  try {
    const manager = new ConfigurationManager();
    
    // Test valid URLs
    const validUrls = [
      'https://fitoutlab.app',
      'https://www.designfitout.com',
      'http://localhost:3000'
    ];
    
    for (const url of validUrls) {
      const validation = manager.validateUrl(url, 'Test URL');
      if (!validation.isValid) {
        throw new Error(`Valid URL failed validation: ${url} - ${validation.errors.join(', ')}`);
      }
    }
    
    // Test invalid URLs
    const invalidUrls = [
      'not-a-url',
      'ftp://invalid-protocol.com',
      ''
    ];
    
    for (const url of invalidUrls) {
      const validation = manager.validateUrl(url, 'Test URL');
      if (validation.isValid) {
        throw new Error(`Invalid URL passed validation: ${url}`);
      }
    }
    
    console.log('✅ URL validation is working correctly');
    return true;
  } catch (error) {
    console.error('❌ URL validation test failed:', error.message);
    return false;
  }
}

// Test that files don't contain hard-coded brand references
function testBrandNeutrality() {
  console.log('Testing brand neutrality...');
  
  const filesToCheck = [
    'public/ind2x.html',
    'deploy',
    'roots'
  ];
  
  // Excluded files where cloud provider names are expected:
  // - README.md (contains documentation references)
  // - DNS_SETUP.md (specifically about Cloudflare configuration)
  // - CLOUDFLARE_WORKERS_GUIDE.md (specifically about Cloudflare Workers)
  
  const bannedTerms = ['firebase', 'ga4', 'gsc'];
  // Note: 'cloudflare' removed from banned terms due to specific requirements
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
    'config-manager.js',
    'CLOUD_PROVIDERS.md',
    'public/ind2x.html',
    'deploy',
    'roots',
    'DNS_SETUP.md',
    'CLOUDFLARE_WORKERS_GUIDE.md'
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

// Test Cloudflare Workers structure and content
function testCloudflareWorkers() {
  console.log('Testing Cloudflare Workers...');
  
  const workerFiles = [
    'workers/mrketoz-worker.js',
    'workers/sevenue-worker.js'
  ];
  
  let allWorkersValid = true;
  
  // Check if workers directory and files exist
  if (!fs.existsSync(path.join(__dirname, 'workers'))) {
    console.error('❌ Workers directory missing');
    return false;
  }
  
  for (const workerFile of workerFiles) {
    const filePath = path.join(__dirname, workerFile);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required worker file missing: ${workerFile}`);
      allWorkersValid = false;
      continue;
    }
    
    // Read and validate worker content
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for essential Cloudflare Worker patterns
      const requiredPatterns = [
        'export default',
        'async fetch\\(request',
        'new Response\\(',
        'Content-Type.*application/json'
      ];
      
      for (const pattern of requiredPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (!regex.test(content)) {
          console.error(`❌ ${workerFile} missing required pattern: ${pattern}`);
          allWorkersValid = false;
        }
      }
      
      // Check for CORS handling
      if (!content.includes('Access-Control-Allow-Origin')) {
        console.error(`❌ ${workerFile} missing CORS headers`);
        allWorkersValid = false;
      }
      
    } catch (error) {
      console.error(`❌ Error reading ${workerFile}: ${error.message}`);
      allWorkersValid = false;
    }
  }
  
  if (allWorkersValid) {
    console.log('✅ Cloudflare Workers structure is valid');
    return true;
  }
  
  return false;
}

// Test DNS documentation content
function testDNSDocumentation() {
  console.log('Testing DNS documentation...');
  
  try {
    const dnsDocPath = path.join(__dirname, 'DNS_SETUP.md');
    if (!fs.existsSync(dnsDocPath)) {
      throw new Error('DNS_SETUP.md not found');
    }
    
    const content = fs.readFileSync(dnsDocPath, 'utf8');
    
    // Check for required DNS documentation sections
    const requiredSections = [
      'Domain Configuration Table',
      'fitoutlab.app',
      'designfitout.com', 
      'SPF.*record',
      'DKIM',
      'DMARC',
      'Cloudflare.*Configuration',
      'Security.*Recommendations'
    ];
    
    for (const section of requiredSections) {
      const regex = new RegExp(section, 'i');
      if (!regex.test(content)) {
        throw new Error(`Missing required DNS documentation section: ${section}`);
      }
    }
    
    // Check for account restriction mentions
    if (!content.includes('support@designfitout.com')) {
      throw new Error('DNS documentation missing security account restrictions');
    }
    
    console.log('✅ DNS documentation is comprehensive');
    return true;
  } catch (error) {
    console.error('❌ DNS documentation test failed:', error.message);
    return false;
  }
}

// Test configuration optimization
function testConfigOptimization() {
  console.log('Testing configuration optimization...');
  
  try {
    const manager = new ConfigurationManager();
    const template = manager.loadTemplate();
    const optimized = manager.optimizeDomainConfig(template);
    
    // Check that optimization added required sections
    if (!optimized.domainOptimizations) {
      throw new Error('Domain optimizations not generated');
    }
    
    if (!optimized.domainOptimizations.primaryDomain || !optimized.domainOptimizations.secondaryDomain) {
      throw new Error('Primary or secondary domain optimizations missing');
    }
    
    if (!optimized.domainOptimizations.crossDomainSupport) {
      throw new Error('Cross-domain support configuration missing');
    }
    
    // Verify analytics optimization if analytics section exists
    if (template.analytics && !optimized.domainAnalytics) {
      throw new Error('Domain analytics optimization not generated');
    }
    
    console.log('✅ Configuration optimization is working correctly');
    return true;
  } catch (error) {
    console.error('❌ Configuration optimization test failed:', error.message);
    return false;
  }
}

// Run all tests
function runTests() {
  console.log('Running enhanced brand neutrality and configuration tests...\n');
  
  const tests = [
    testConfigTemplate,
    testDualDomainConfiguration,
    testEnvironmentVariables,
    testUrlValidation,
    testBrandNeutrality,
    testFileStructure,
    testConfigOptimization,
    testCloudflareWorkers,
    testDNSDocumentation
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
    console.log('🎉 All tests passed! Repository supports enhanced dual domain configuration.');
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
  testDualDomainConfiguration,
  testEnvironmentVariables,
  testUrlValidation,
  testBrandNeutrality,
  testFileStructure,
  testConfigOptimization,
  testCloudflareWorkers,
  testDNSDocumentation,
  runTests
};