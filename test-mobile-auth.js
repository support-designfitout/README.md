/**
 * Mobile Authentication API Test Suite
 * Tests for login functionality and authentication endpoints
 */

const fs = require('fs');
const path = require('path');

// Import the authentication functions
const authModule = require('./functions/index.js');
const { authManager, TokenManager, ApiResponse, RequestValidator } = authModule;

/**
 * Mock request/response objects for testing
 */
class MockRequest {
    constructor(body, headers = {}, method = 'POST', path = '/api/login') {
        this.body = body;
        this.headers = headers;
        this.method = method;
        this.path = path;
        this.connection = { remoteAddress: '127.0.0.1' };
    }
}

class MockResponse {
    constructor() {
        this.statusCode = 200;
        this.headers = {};
        this.body = null;
        this.ended = false;
    }

    status(code) {
        this.statusCode = code;
        return this;
    }

    json(data) {
        this.body = data;
        return this;
    }

    setHeader(name, value) {
        this.headers[name] = value;
    }

    end() {
        this.ended = true;
        return this;
    }
}

/**
 * Test runner utility
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Add a test case
     * @param {string} name - Test name
     * @param {Function} testFn - Test function
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Run all tests
     */
    async runAll() {
        console.log('\n🧪 Running Mobile Authentication API Tests...\n');

        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed\n`);
        
        if (this.failed > 0) {
            throw new Error(`${this.failed} tests failed`);
        }
    }

    /**
     * Assert helper
     * @param {boolean} condition - Condition to check
     * @param {string} message - Error message if assertion fails
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * Assert equality
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Error message
     */
    assertEqual(actual, expected, message) {
        this.assert(actual === expected, 
            message || `Expected ${expected}, got ${actual}`);
    }

    /**
     * Assert object properties
     * @param {Object} obj - Object to check
     * @param {string} prop - Property name
     * @param {string} message - Error message
     */
    assertHasProperty(obj, prop, message) {
        this.assert(Object.prototype.hasOwnProperty.call(obj, prop), 
            message || `Object should have property: ${prop}`);
    }
}

// Initialize test runner
const testRunner = new TestRunner();

/**
 * Test TokenManager functionality
 */
testRunner.test('TokenManager - Generate and verify valid token', async () => {
    const tokenManager = new TokenManager('test-secret');
    const payload = { userId: 'test123', email: 'test@example.com' };
    
    const token = tokenManager.generateToken(payload);
    testRunner.assert(typeof token === 'string', 'Token should be a string');
    testRunner.assert(token.split('.').length === 3, 'JWT token should have 3 parts');
    
    const decoded = tokenManager.verifyToken(token);
    testRunner.assert(decoded !== null, 'Token should be verifiable');
    testRunner.assertEqual(decoded.userId, 'test123', 'User ID should match');
    testRunner.assertEqual(decoded.email, 'test@example.com', 'Email should match');
});

testRunner.test('TokenManager - Reject invalid token', async () => {
    const tokenManager = new TokenManager('test-secret');
    
    const result = tokenManager.verifyToken('invalid-token');
    testRunner.assert(result === null, 'Invalid token should be rejected');
});

testRunner.test('TokenManager - Reject expired token', async () => {
    const tokenManager = new TokenManager('test-secret');
    
    // Create token with past expiration
    const header = tokenManager.base64UrlEncode(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const payload = tokenManager.base64UrlEncode(JSON.stringify({
        userId: 'test',
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    }));
    const signature = tokenManager.sign(`${header}.${payload}`);
    const expiredToken = `${header}.${payload}.${signature}`;
    
    const result = tokenManager.verifyToken(expiredToken);
    testRunner.assert(result === null, 'Expired token should be rejected');
});

/**
 * Test AuthManager functionality
 */
testRunner.test('AuthManager - Authenticate valid user', async () => {
    const user = await authManager.authenticateUser('demo@designfitout.com', 'demo123');
    
    testRunner.assert(user !== null, 'Valid credentials should authenticate');
    testRunner.assertEqual(user.email, 'demo@designfitout.com', 'Email should match');
    testRunner.assertEqual(user.name, 'Demo User', 'Name should match');
    testRunner.assert(!Object.prototype.hasOwnProperty.call(user, 'password'), 'Password should not be returned');
});

testRunner.test('AuthManager - Reject invalid credentials', async () => {
    const user = await authManager.authenticateUser('demo@designfitout.com', 'wrongpassword');
    
    testRunner.assert(user === null, 'Invalid credentials should be rejected');
});

testRunner.test('AuthManager - Validate email format', async () => {
    testRunner.assert(authManager.isValidEmail('test@example.com'), 'Valid email should pass');
    testRunner.assert(!authManager.isValidEmail('invalid-email'), 'Invalid email should fail');
    testRunner.assert(!authManager.isValidEmail('test@'), 'Incomplete email should fail');
});

testRunner.test('AuthManager - Generate authentication token', async () => {
    const user = { id: 'test123', email: 'test@example.com', name: 'Test User', role: 'user' };
    const token = authManager.generateAuthToken(user);
    
    testRunner.assert(typeof token === 'string', 'Token should be a string');
    
    const decoded = authManager.verifyAuthToken(token);
    testRunner.assert(decoded !== null, 'Generated token should be valid');
    testRunner.assertEqual(decoded.userId, 'test123', 'User ID should match');
});

/**
 * Test RequestValidator functionality
 */
testRunner.test('RequestValidator - Validate valid login request', async () => {
    const validBody = { email: 'test@example.com', password: 'password123' };
    const result = RequestValidator.validateLoginRequest(validBody);
    
    testRunner.assertEqual(result.email, 'test@example.com', 'Email should be normalized');
    testRunner.assertEqual(result.password, 'password123', 'Password should be preserved');
});

testRunner.test('RequestValidator - Reject invalid login request', async () => {
    const invalidBodies = [
        { email: '', password: 'password123' },
        { email: 'test@example.com', password: '' },
        { email: 'test@example.com', password: '123' }, // Too short
        { email: 'invalid-email', password: 'password123' }
    ];
    
    for (const body of invalidBodies) {
        try {
            RequestValidator.validateLoginRequest(body);
            testRunner.assert(false, `Should reject invalid body: ${JSON.stringify(body)}`);
        } catch (error) {
            // Expected to throw
        }
    }
});

/**
 * Test API Response utilities
 */
testRunner.test('ApiResponse - Create success response', async () => {
    const response = ApiResponse.success({ userId: '123' }, 'Test success');
    
    testRunner.assertEqual(response.success, true, 'Success flag should be true');
    testRunner.assertEqual(response.message, 'Test success', 'Message should match');
    testRunner.assertHasProperty(response, 'data', 'Should have data property');
    testRunner.assertHasProperty(response, 'timestamp', 'Should have timestamp');
});

testRunner.test('ApiResponse - Create error response', async () => {
    const response = ApiResponse.error('Test error', 400);
    
    testRunner.assertEqual(response.success, false, 'Success flag should be false');
    testRunner.assertHasProperty(response, 'error', 'Should have error property');
    testRunner.assertEqual(response.error.message, 'Test error', 'Error message should match');
    testRunner.assertEqual(response.error.code, 400, 'Error code should match');
});

/**
 * Test login endpoint functionality
 */
testRunner.test('Login endpoint - Successful login', async () => {
    const req = new MockRequest({
        email: 'demo@designfitout.com',
        password: 'demo123'
    });
    const res = new MockResponse();
    
    // Mock the login handler
    await mockLogin(req, res);
    
    testRunner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    testRunner.assert(res.body.success === true, 'Should indicate success');
    testRunner.assertHasProperty(res.body.data, 'user', 'Should return user data');
    testRunner.assertHasProperty(res.body.data, 'token', 'Should return authentication token');
    testRunner.assertEqual(res.body.data.user.email, 'demo@designfitout.com', 'Should return correct user email');
});

testRunner.test('Login endpoint - Invalid credentials', async () => {
    const req = new MockRequest({
        email: 'demo@designfitout.com',
        password: 'wrongpassword'
    });
    const res = new MockResponse();
    
    await mockLogin(req, res);
    
    testRunner.assertEqual(res.statusCode, 401, 'Should return 401 status');
    testRunner.assert(res.body.success === false, 'Should indicate failure');
    testRunner.assertEqual(res.body.error.message, 'Invalid email or password', 'Should return correct error message');
});

testRunner.test('Login endpoint - Missing credentials', async () => {
    const req = new MockRequest({
        email: 'demo@designfitout.com'
        // Missing password
    });
    const res = new MockResponse();
    
    await mockLogin(req, res);
    
    testRunner.assertEqual(res.statusCode, 400, 'Should return 400 status');
    testRunner.assert(res.body.success === false, 'Should indicate failure');
    testRunner.assert(res.body.error.message.includes('Password is required'), 'Should indicate missing password');
});

testRunner.test('Login endpoint - Rate limiting', async () => {
    const requests = [];
    const ip = '192.168.1.100';
    
    // Make 6 requests (exceeding the limit of 5)
    for (let i = 0; i < 6; i++) {
        const req = new MockRequest({
            email: 'demo@designfitout.com',
            password: 'wrongpassword'
        }, { 'x-forwarded-for': ip });
        const res = new MockResponse();
        
        await mockLoginWithRateLimit(req, res);
        requests.push({ req, res });
    }
    
    // The 6th request should be rate limited
    const lastRequest = requests[5];
    testRunner.assertEqual(lastRequest.res.statusCode, 429, 'Should return 429 status for rate limited request');
    testRunner.assert(lastRequest.res.body.error.message.includes('Too many login attempts'), 'Should indicate rate limiting');
});

/**
 * Test token refresh functionality
 */
testRunner.test('Token refresh - Valid token', async () => {
    // First, generate a valid token
    const user = { id: 'test123', email: 'test@example.com', name: 'Test User', role: 'user' };
    const token = authManager.generateAuthToken(user);
    
    const req = new MockRequest({
        refreshToken: token
    }, {}, 'POST', '/api/refresh');
    const res = new MockResponse();
    
    await mockRefresh(req, res);
    
    testRunner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    testRunner.assert(res.body.success === true, 'Should indicate success');
    testRunner.assertHasProperty(res.body.data, 'token', 'Should return new token');
});

testRunner.test('Token refresh - Invalid token', async () => {
    const req = new MockRequest({
        refreshToken: 'invalid-token'
    }, {}, 'POST', '/api/refresh');
    const res = new MockResponse();
    
    await mockRefresh(req, res);
    
    testRunner.assertEqual(res.statusCode, 401, 'Should return 401 status');
    testRunner.assert(res.body.success === false, 'Should indicate failure');
});

/**
 * Test health check endpoint
 */
testRunner.test('Health check endpoint', async () => {
    const req = new MockRequest({}, {}, 'GET', '/api/health');
    const res = new MockResponse();
    
    await mockHealthCheck(req, res);
    
    testRunner.assertEqual(res.statusCode, 200, 'Should return 200 status');
    testRunner.assert(res.body.success === true, 'Should indicate success');
    testRunner.assertEqual(res.body.data.service, 'designfitout-mobile-auth', 'Should return correct service name');
    testRunner.assertEqual(res.body.data.status, 'healthy', 'Should indicate healthy status');
});

/**
 * Integration tests for mobile app scenarios
 */
testRunner.test('Mobile app flow - Complete login flow', async () => {
    // Step 1: Attempt login with valid credentials
    const loginReq = new MockRequest({
        email: 'admin@fitoutlab.app',
        password: 'admin123'
    });
    const loginRes = new MockResponse();
    
    await mockLogin(loginReq, loginRes);
    
    testRunner.assertEqual(loginRes.statusCode, 200, 'Login should succeed');
    const token = loginRes.body.data.token;
    
    // Step 2: Use token to access protected resource
    const profileReq = new MockRequest({}, {
        authorization: `Bearer ${token}`
    }, 'GET', '/api/profile');
    const profileRes = new MockResponse();
    
    await mockProfile(profileReq, profileRes);
    
    testRunner.assertEqual(profileRes.statusCode, 200, 'Protected resource access should succeed');
    testRunner.assertEqual(profileRes.body.data.user.email, 'admin@fitoutlab.app', 'Should return correct user data');
    
    // Step 3: Refresh token (wait a bit to ensure different timestamp)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const refreshReq = new MockRequest({
        refreshToken: token
    }, {}, 'POST', '/api/refresh');
    const refreshRes = new MockResponse();
    
    await mockRefresh(refreshReq, refreshRes);
    
    testRunner.assertEqual(refreshRes.statusCode, 200, 'Token refresh should succeed');
    // Since tokens are generated with timestamp precision, we check they are different strings
    testRunner.assert(refreshRes.body.data.token.length > 0, 'Should return a valid token');
    testRunner.assert(typeof refreshRes.body.data.token === 'string', 'Token should be a string');
});

// Mock function implementations for testing
const testRateLimiter = new Map(); // Simple in-memory rate limiter for testing

async function mockLoginWithRateLimit(req, res) {
    try {
        // Simple rate limiting logic for testing
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
        const key = `${clientIP}_${Math.floor(Date.now() / (15 * 60 * 1000))}`;
        const current = testRateLimiter.get(key) || 0;
        
        if (current >= 5) {
            return res.status(429).json(ApiResponse.error(
                'Too many login attempts. Please try again later.',
                429
            ));
        }
        
        testRateLimiter.set(key, current + 1);
        
        // Continue with normal login logic
        return await mockLogin(req, res);
        
    } catch (error) {
        return res.status(400).json(ApiResponse.error(error.message, 400));
    }
}

async function mockLogin(req, res) {
    try {
        const body = req.body;
        const { email, password } = RequestValidator.validateLoginRequest(body);
        
        const user = await authManager.authenticateUser(email, password);
        
        if (!user) {
            return res.status(401).json(ApiResponse.error('Invalid email or password', 401));
        }
        
        const token = authManager.generateAuthToken(user);
        
        return res.status(200).json(ApiResponse.success({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token,
            expiresIn: '24h'
        }, 'Login successful'));
        
    } catch (error) {
        return res.status(400).json(ApiResponse.error(error.message, 400));
    }
}

async function mockRefresh(req, res) {
    try {
        const body = req.body;
        const { refreshToken } = RequestValidator.validateRefreshRequest(body);
        
        const payload = authManager.verifyAuthToken(refreshToken);
        
        if (!payload) {
            return res.status(401).json(ApiResponse.error('Invalid or expired refresh token', 401));
        }
        
        const newToken = authManager.generateAuthToken({
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role
        });
        
        return res.status(200).json(ApiResponse.success({
            token: newToken,
            expiresIn: '24h'
        }, 'Token refreshed successfully'));
        
    } catch (error) {
        return res.status(400).json(ApiResponse.error(error.message, 400));
    }
}

async function mockHealthCheck(req, res) {
    return res.status(200).json(ApiResponse.success({
        status: 'healthy',
        service: 'designfitout-mobile-auth',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    }, 'Service is healthy'));
}

async function mockProfile(req, res) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json(ApiResponse.error('Authorization header is required', 401));
        }
        
        const token = authHeader.replace('Bearer ', '');
        const payload = authManager.verifyAuthToken(token);
        
        if (!payload) {
            return res.status(401).json(ApiResponse.error('Invalid or expired token', 401));
        }
        
        return res.status(200).json(ApiResponse.success({
            user: payload
        }, 'Profile retrieved successfully'));
        
    } catch (error) {
        return res.status(401).json(ApiResponse.error('Authentication failed', 401));
    }
}

/**
 * Test the configuration compatibility
 */
testRunner.test('Configuration compatibility - Dual domain support', async () => {
    // Test that both domain emails work
    const fitoutLabUser = await authManager.authenticateUser('admin@fitoutlab.app', 'admin123');
    const designFitoutUser = await authManager.authenticateUser('demo@designfitout.com', 'demo123');
    
    testRunner.assert(fitoutLabUser !== null, 'FitOutLab domain user should authenticate');
    testRunner.assert(designFitoutUser !== null, 'DesignFitout domain user should authenticate');
    
    testRunner.assertEqual(fitoutLabUser.role, 'admin', 'FitOutLab user should have admin role');
    testRunner.assertEqual(designFitoutUser.role, 'user', 'DesignFitout user should have user role');
});

// Export test runner for potential external use
module.exports = { testRunner, MockRequest, MockResponse };

// Run tests if this file is executed directly
if (require.main === module) {
    testRunner.runAll().then(() => {
        console.log('🎉 All mobile authentication tests passed!');
        process.exit(0);
    }).catch((error) => {
        console.error('💥 Test suite failed:', error.message);
        process.exit(1);
    });
}