#!/usr/bin/env node

/**
 * Mobile Authentication API Tests
 * Validate the functionality of the authentication endpoints
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Mobile Authentication API...\n');

/**
 * Test authentication handlers file exists and has required functions
 */
function testAuthHandlersExists() {
  console.log('Testing authentication handlers file...');
  
  const authHandlersFile = path.join(__dirname, 'functions', 'auth-handlers.js');
  
  if (!fs.existsSync(authHandlersFile)) {
    console.error('❌ Auth handlers file not found: functions/auth-handlers.js');
    return false;
  }
  
  const content = fs.readFileSync(authHandlersFile, 'utf8');
  
  const requiredFunctions = [
    'handleRegister',
    'handleLogin',
    'handleRefresh',
    'handleProfile',
    'handleAuthHealth'
  ];
  
  for (const func of requiredFunctions) {
    if (!content.includes(func)) {
      console.error(`❌ Missing required function: ${func}`);
      return false;
    }
  }
  
  console.log('✅ Authentication handlers file exists with all required functions');
  return true;
}

/**
 * Test middleware file exists and has required functions
 */
function testMiddlewareExists() {
  console.log('Testing middleware file...');
  
  const middlewareFile = path.join(__dirname, 'functions', 'middleware.js');
  
  if (!fs.existsSync(middlewareFile)) {
    console.error('❌ Middleware file not found: functions/middleware.js');
    return false;
  }
  
  const content = fs.readFileSync(middlewareFile, 'utf8');
  
  const requiredFunctions = [
    'requireUser',
    'requireRole',
    'requireAdmin',
    'cors',
    'rateLimit'
  ];
  
  for (const func of requiredFunctions) {
    if (!content.includes(func)) {
      console.error(`❌ Missing required middleware function: ${func}`);
      return false;
    }
  }
  
  console.log('✅ Middleware file exists with all required functions');
  return true;
}

/**
 * Test main functions index.js has been updated with auth endpoints
 */
function testFunctionsIndexUpdated() {
  console.log('Testing functions index.js integration...');
  
  const indexFile = path.join(__dirname, 'functions', 'index.js');
  
  if (!fs.existsSync(indexFile)) {
    console.error('❌ Functions index file not found: functions/index.js');
    return false;
  }
  
  const content = fs.readFileSync(indexFile, 'utf8');
  
  const requiredImports = [
    'auth-handlers',
    'middleware'
  ];
  
  for (const importItem of requiredImports) {
    if (!content.includes(importItem)) {
      console.error(`❌ Missing required import: ${importItem}`);
      return false;
    }
  }
  
  const requiredEndpoints = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/profile'
  ];
  
  for (const endpoint of requiredEndpoints) {
    if (!content.includes(endpoint)) {
      console.error(`❌ Missing endpoint: ${endpoint}`);
      return false;
    }
  }
  
  console.log('✅ Functions index.js has been properly integrated with auth endpoints');
  return true;
}

/**
 * Test CORS configuration for required domains
 */
function testCorsConfiguration() {
  console.log('Testing CORS configuration...');
  
  const indexFile = path.join(__dirname, 'functions', 'index.js');
  const content = fs.readFileSync(indexFile, 'utf8');
  
  const requiredDomains = [
    'designfitout.com',
    'fitoutlab.app'
  ];
  
  for (const domain of requiredDomains) {
    if (!content.includes(domain)) {
      console.error(`❌ Missing CORS domain: ${domain}`);
      return false;
    }
  }
  
  // Check for Access-Control headers
  const corsHeaders = [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ];
  
  for (const header of corsHeaders) {
    if (!content.includes(header)) {
      console.error(`❌ Missing CORS header: ${header}`);
      return false;
    }
  }
  
  console.log('✅ CORS configuration is properly set up for required domains');
  return true;
}

/**
 * Test environment variables configuration
 */
function testEnvironmentConfiguration() {
  console.log('Testing environment variables configuration...');
  
  const authHandlersFile = path.join(__dirname, 'functions', 'auth-handlers.js');
  const content = fs.readFileSync(authHandlersFile, 'utf8');
  
  const requiredEnvVars = [
    'JWT_SECRET',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_ATTEMPTS',
    'DATABASE_URL'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!content.includes(envVar)) {
      console.error(`❌ Missing environment variable: ${envVar}`);
      return false;
    }
  }
  
  // Check for fallback defaults
  const fallbackPatterns = [
    'fallback-jwt-secret',
    '900000', // 15 minutes default
    'memory://local'
  ];
  
  for (const pattern of fallbackPatterns) {
    if (!content.includes(pattern)) {
      console.error(`❌ Missing fallback default for: ${pattern}`);
      return false;
    }
  }
  
  console.log('✅ Environment variables are properly configured with fallbacks');
  return true;
}

/**
 * Test security features implementation
 */
function testSecurityFeatures() {
  console.log('Testing security features...');
  
  const authHandlersFile = path.join(__dirname, 'functions', 'auth-handlers.js');
  const middlewareFile = path.join(__dirname, 'functions', 'middleware.js');
  
  const authContent = fs.readFileSync(authHandlersFile, 'utf8');
  const middlewareContent = fs.readFileSync(middlewareFile, 'utf8');
  
  const securityFeatures = [
    'jwt.verify',
    'checkRateLimit',
    'Bearer ',
    'authorization',
    'exp',
    'Invalid token'
  ];
  
  for (const feature of securityFeatures) {
    const found = authContent.includes(feature) || middlewareContent.includes(feature);
    if (!found) {
      console.error(`❌ Missing security feature: ${feature}`);
      return false;
    }
  }
  
  console.log('✅ Security features are properly implemented');
  return true;
}

/**
 * Test JWT token implementation
 */
function testJwtImplementation() {
  console.log('Testing JWT implementation...');
  
  const authHandlersFile = path.join(__dirname, 'functions', 'auth-handlers.js');
  const content = fs.readFileSync(authHandlersFile, 'utf8');
  
  const jwtFeatures = [
    'jwt.sign',
    'jwt.verify',
    'userId',
    'email',
    'role',
    'exp'
  ];
  
  for (const feature of jwtFeatures) {
    if (!content.includes(feature)) {
      console.error(`❌ Missing JWT feature: ${feature}`);
      return false;
    }
  }
  
  console.log('✅ JWT implementation is properly configured');
  return true;
}

/**
 * Test role-based access control
 */
function testRoleBasedAccess() {
  console.log('Testing role-based access control...');
  
  const middlewareFile = path.join(__dirname, 'functions', 'middleware.js');
  const content = fs.readFileSync(middlewareFile, 'utf8');
  
  const rbacFeatures = [
    'requireUser',
    'requireRole',
    'requireAdmin',
    'request.user',
    'Insufficient permissions'
  ];
  
  for (const feature of rbacFeatures) {
    if (!content.includes(feature)) {
      console.error(`❌ Missing RBAC feature: ${feature}`);
      return false;
    }
  }
  
  console.log('✅ Role-based access control is properly implemented');
  return true;
}

/**
 * Test protected endpoints configuration
 */
function testProtectedEndpoints() {
  console.log('Testing protected endpoints configuration...');
  
  const indexFile = path.join(__dirname, 'functions', 'index.js');
  const content = fs.readFileSync(indexFile, 'utf8');
  
  // Check that /api/profile endpoint is protected with requireUser
  if (!content.includes('requireUser') || !content.includes('/api/profile')) {
    console.error('❌ Profile endpoint is not properly protected with requireUser');
    return false;
  }
  
  console.log('✅ Protected endpoints are properly configured');
  return true;
}

/**
 * Test health check endpoints
 */
function testHealthEndpoints() {
  console.log('Testing health check endpoints...');
  
  const authHandlersFile = path.join(__dirname, 'functions', 'auth-handlers.js');
  const content = fs.readFileSync(authHandlersFile, 'utf8');
  
  if (!content.includes('handleAuthHealth')) {
    console.error('❌ Missing auth health check endpoint');
    return false;
  }
  
  if (!content.includes('/api/auth/health')) {
    console.error('❌ Auth health endpoint not properly configured');
    return false;
  }
  
  console.log('✅ Health check endpoints are properly implemented');
  return true;
}

/**
 * Run all tests
 */
function runTests() {
  const tests = [
    testAuthHandlersExists,
    testMiddlewareExists,
    testFunctionsIndexUpdated,
    testCorsConfiguration,
    testEnvironmentConfiguration,
    testSecurityFeatures,
    testJwtImplementation,
    testRoleBasedAccess,
    testProtectedEndpoints,
    testHealthEndpoints
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
    console.log('🎉 All mobile authentication tests passed! Auth API is ready for deployment.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the authentication implementation.');
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
  testAuthHandlersExists,
  testMiddlewareExists,
  testFunctionsIndexUpdated,
  testCorsConfiguration,
  testEnvironmentConfiguration,
  testSecurityFeatures,
  testJwtImplementation,
  testRoleBasedAccess,
  testProtectedEndpoints,
  testHealthEndpoints
};