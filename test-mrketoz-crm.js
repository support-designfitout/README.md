#!/usr/bin/env node

/**
 * MrketOz CRM Chat Endpoint Tests
 * Validate the functionality of the /chat endpoint
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing MrketOz CRM Chat Endpoint...\n');

/**
 * Test basic function existence and structure
 */
function testChatFunctionExists() {
  console.log('Testing chat function structure...');
  
  const chatFile = path.join(__dirname, 'functions', 'mrketoz-crm-chat.js');
  const indexFile = path.join(__dirname, 'functions', 'index.js');
  
  if (!fs.existsSync(chatFile)) {
    console.error('❌ MrketOz chat file not found');
    return false;
  }
  
  if (!fs.existsSync(indexFile)) {
    console.error('❌ Functions index file not found');
    return false;
  }
  
  const chatContent = fs.readFileSync(chatFile, 'utf8');
  const indexContent = fs.readFileSync(indexFile, 'utf8');
  
  // Check for required functions
  const requiredFunctions = [
    'handleChatRequest',
    'handleMainChat',
    'handleQuotationRequest',
    'handleDeliveryTracking',
    'handleSupportRequest'
  ];
  
  for (const func of requiredFunctions) {
    if (!chatContent.includes(func)) {
      console.error(`❌ Missing function: ${func}`);
      return false;
    }
  }
  
  // Check for security configuration
  if (!chatContent.includes('support@designfitout.com')) {
    console.error('❌ Admin email restriction not found');
    return false;
  }
  
  // Check for CRM name
  if (!chatContent.includes('MrketOz CRM')) {
    console.error('❌ MrketOz CRM branding not found');
    return false;
  }
  
  console.log('✅ Chat function structure is valid');
  return true;
}

/**
 * Test endpoint configuration
 */
function testEndpointConfiguration() {
  console.log('Testing endpoint configuration...');
  
  const chatFile = path.join(__dirname, 'functions', 'mrketoz-crm-chat.js');
  const content = fs.readFileSync(chatFile, 'utf8');
  
  const requiredEndpoints = [
    '/chat',
    '/chat/quotation',
    '/chat/delivery',
    '/chat/support'
  ];
  
  for (const endpoint of requiredEndpoints) {
    if (!content.includes(`'${endpoint}'`) && !content.includes(`"${endpoint}"`)) {
      console.error(`❌ Endpoint not configured: ${endpoint}`);
      return false;
    }
  }
  
  console.log('✅ Endpoint configuration is valid');
  return true;
}

/**
 * Test response structure
 */
function testResponseStructure() {
  console.log('Testing response structure...');
  
  const chatFile = path.join(__dirname, 'functions', 'mrketoz-crm-chat.js');
  const content = fs.readFileSync(chatFile, 'utf8');
  
  const requiredResponseFields = [
    'reply',
    'options',
    'timestamp',
    'Request Quotation',
    'Track Delivery',
    'Connect Support'
  ];
  
  for (const field of requiredResponseFields) {
    if (!content.includes(field)) {
      console.error(`❌ Missing response field/option: ${field}`);
      return false;
    }
  }
  
  console.log('✅ Response structure is valid');
  return true;
}

/**
 * Test cloud-agnostic compatibility
 */
function testCloudAgnosticCompatibility() {
  console.log('Testing cloud-agnostic compatibility...');
  
  const indexFile = path.join(__dirname, 'functions', 'index.js');
  const content = fs.readFileSync(indexFile, 'utf8');
  
  const requiredExports = [
    'export default',        // Cloudflare Workers
    'exports.chat',          // Google Cloud Functions
    'exports.handler'        // AWS Lambda
  ];
  
  for (const exportFormat of requiredExports) {
    if (!content.includes(exportFormat)) {
      console.error(`❌ Missing export format: ${exportFormat}`);
      return false;
    }
  }
  
  console.log('✅ Cloud-agnostic compatibility verified');
  return true;
}

/**
 * Test security features
 */
function testSecurityFeatures() {
  console.log('Testing security features...');
  
  const chatFile = path.join(__dirname, 'functions', 'mrketoz-crm-chat.js');
  const content = fs.readFileSync(chatFile, 'utf8');
  
  const securityFeatures = [
    'Access-Control-Allow-Origin',
    'authorization',
    'support@designfitout.com',
    'isAdminRequest'
  ];
  
  for (const feature of securityFeatures) {
    if (!content.includes(feature)) {
      console.error(`❌ Missing security feature: ${feature}`);
      return false;
    }
  }
  
  console.log('✅ Security features verified');
  return true;
}

/**
 * Run all tests
 */
function runTests() {
  const tests = [
    testChatFunctionExists,
    testEndpointConfiguration,
    testResponseStructure,
    testCloudAgnosticCompatibility,
    testSecurityFeatures
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      }
    } catch (error) {
      console.error(`❌ Test error: ${error.message}`);
    }
    console.log(''); // Empty line for readability
  }
  
  console.log(`Tests completed: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All MrketOz CRM tests passed! Chat endpoint is ready for deployment.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runTests,
  testChatFunctionExists,
  testEndpointConfiguration,
  testResponseStructure,
  testCloudAgnosticCompatibility,
  testSecurityFeatures
};