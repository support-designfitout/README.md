/**
 * Designfitout Mobile Authentication API
 * Cloud-agnostic serverless functions for mobile app login functionality
 * Supports dual domain configuration and brand neutrality
 */

// Core dependencies (cloud-agnostic implementations)
const crypto = require('crypto');

/**
 * JWT Token utility functions
 * Lightweight implementation to avoid external dependencies
 */
class TokenManager {
    constructor(secret) {
        // Determine environment
        const env = process.env.NODE_ENV || 'development';
        if (!secret) {
            if (env === 'development') {
                this.secret = 'default-dev-secret';
                console.warn('Warning: Using default JWT secret in development environment.');
            } else {
                throw new Error('JWT_SECRET environment variable must be set in production.');
            }
        } else {
            this.secret = secret;
        }
        this.algorithm = 'HS256';
        this.expiresIn = '24h'; // 24 hours token expiry
    }

    /**
     * Generate JWT token
     * @param {Object} payload - User data to encode
     * @returns {string} JWT token
     */
    generateToken(payload) {
        const header = {
            alg: this.algorithm,
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const tokenPayload = {
            ...payload,
            iat: now,
            exp: now + (24 * 60 * 60), // 24 hours from now
            iss: 'designfitout-mobile-api'
        };

        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
        
        const signature = this.sign(`${encodedHeader}.${encodedPayload}`);
        
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    /**
     * Verify and decode JWT token
     * @param {string} token - JWT token to verify
     * @returns {Object|null} Decoded payload or null if invalid
     */
    verifyToken(token) {
        try {
            const [headerB64, payloadB64, signatureB64] = token.split('.');
            
            if (!headerB64 || !payloadB64 || !signatureB64) {
                return null;
            }

            // Verify signature
            const expectedSignature = this.sign(`${headerB64}.${payloadB64}`);
            if (signatureB64 !== expectedSignature) {
                console.warn('Token signature verification failed');
                return null;
            }

            // Decode payload
            const payload = JSON.parse(this.base64UrlDecode(payloadB64));
            
            // Check expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                console.warn('Token expired');
                return null;
            }

            return payload;
        } catch (error) {
            console.error('Token verification error:', error.message);
            return null;
        }
    }

    /**
     * Generate signature for JWT token
     * @param {string} data - Data to sign
     * @returns {string} Base64url encoded signature
     */
    sign(data) {
        const signature = crypto.createHmac('sha256', this.secret)
            .update(data)
            .digest('base64');
        return this.base64UrlEncode(signature);
    }

    /**
     * Base64URL encode
     * @param {string} str - String to encode
     * @returns {string} Base64URL encoded string
     */
    base64UrlEncode(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Base64URL decode
     * @param {string} str - String to decode
     * @returns {string} Decoded string
     */
    base64UrlDecode(str) {
        str += '='.repeat((4 - str.length % 4) % 4);
        return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    }
}

/**
 * User Authentication Manager
 * Handles user validation and authentication logic
 */
class AuthManager {
    constructor() {
        this.tokenManager = new TokenManager();
        // In production, this would connect to a real database
        this.users = new Map();
        this.initializeTestUsers();
    }

    /**
     * Initialize test users for development
     * In production, this would be replaced with database queries
     */
    initializeTestUsers() {
        // Test user for development - REMOVE IN PRODUCTION
        const testUsers = [
            {
                id: 'user_001',
                email: 'demo@designfitout.com',
                password: this.hashPassword('demo123'), // Demo password
                name: 'Demo User',
                role: 'user',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'admin_001',
                email: 'admin@fitoutlab.app',
                password: this.hashPassword('admin123'), // Admin password
                name: 'Admin User',
                role: 'admin',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];

        testUsers.forEach(user => {
            this.users.set(user.email, user);
        });
    }

    /**
     * Hash password using SHA-256
     * In production, use bcrypt or similar secure hashing
     * @param {string} password - Plain text password
     * @returns {string} Hashed password
     */
    hashPassword(password) {
        return crypto.createHash('sha256').update(password + 'designfitout_salt').digest('hex');
    }

    /**
     * Authenticate user credentials
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object|null} User object if authentication succeeds, null otherwise
     */
    async authenticateUser(email, password) {
        try {
            // Input validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Invalid email format');
            }

            // Find user (in production, query database)
            const user = this.users.get(email.toLowerCase());
            if (!user) {
                console.warn(`Authentication failed - user not found: ${email}`);
                return null;
            }

            // Check if user is active
            if (!user.isActive) {
                throw new Error('User account is deactivated');
            }

            // Verify password
            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                console.warn(`Authentication failed - invalid password for: ${email}`);
                return null;
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;

        } catch (error) {
            console.error('Authentication error:', error.message);
            throw error;
        }
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Generate authentication token for user
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    generateAuthToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        return this.tokenManager.generateToken(payload);
    }

    /**
     * Verify authentication token
     * @param {string} token - JWT token to verify
     * @returns {Object|null} User payload if token is valid
     */
    verifyAuthToken(token) {
        return this.tokenManager.verifyToken(token);
    }
}

/**
 * Request validation and sanitization utilities
 */
class RequestValidator {
    /**
     * Validate login request
     * @param {Object} body - Request body
     * @returns {Object} Validated and sanitized data
     */
    static validateLoginRequest(body) {
        const errors = [];

        // Check required fields
        if (!body.email) {
            errors.push('Email is required');
        } else if (typeof body.email !== 'string') {
            errors.push('Email must be a string');
        } else if (body.email.length > 255) {
            errors.push('Email is too long');
        }

        if (!body.password) {
            errors.push('Password is required');
        } else if (typeof body.password !== 'string') {
            errors.push('Password must be a string');
        } else if (body.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        } else if (body.password.length > 255) {
            errors.push('Password is too long');
        }

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        return {
            email: body.email.trim().toLowerCase(),
            password: body.password
        };
    }

    /**
     * Validate refresh token request
     * @param {Object} body - Request body
     * @returns {Object} Validated data
     */
    static validateRefreshRequest(body) {
        if (!body.refreshToken || typeof body.refreshToken !== 'string') {
            throw new Error('Valid refresh token is required');
        }

        return {
            refreshToken: body.refreshToken.trim()
        };
    }
}

/**
 * Rate limiting utility
 * In production, use Redis or similar for distributed rate limiting
 */
class RateLimiter {
    constructor() {
        this.attempts = new Map();
        this.cleanup();
    }

    /**
     * Check if request should be rate limited
     * @param {string} identifier - IP or user identifier
     * @param {number} maxAttempts - Maximum attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} True if request should be blocked
     */
    isRateLimited(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        const now = Date.now();
        const key = `${identifier}_${Math.floor(now / windowMs)}`;
        
        const current = this.attempts.get(key) || 0;
        
        if (current >= maxAttempts) {
            return true;
        }
        
        this.attempts.set(key, current + 1);
        return false;
    }

    /**
     * Clean up old rate limiting entries
     */
    cleanup() {
        setInterval(() => {
            const now = Date.now();
            const cutoff = now - (30 * 60 * 1000); // 30 minutes ago
            
            for (const [key, timestamp] of this.attempts.entries()) {
                if (timestamp < cutoff) {
                    this.attempts.delete(key);
                }
            }
        }, 5 * 60 * 1000); // Clean up every 5 minutes
    }
}

/**
 * API Response utilities
 */
class ApiResponse {
    /**
     * Create success response
     * @param {Object} data - Response data
     * @param {string} message - Success message
     * @returns {Object} Success response object
     */
    static success(data, message = 'Success') {
        return {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create error response
     * @param {string} message - Error message
     * @param {number} code - Error code
     * @param {Object} details - Additional error details
     * @returns {Object} Error response object
     */
    static error(message, code = 400, details = null) {
        return {
            success: false,
            error: {
                message,
                code,
                details
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize global instances
const authManager = new AuthManager();
const rateLimiter = new RateLimiter();

/**
 * Mobile App Login Endpoint
 * POST /api/login
 */
async function handleLogin(req, res) {
    try {
        // Get client IP for rate limiting
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        'unknown';

        // Check rate limiting
        if (rateLimiter.isRateLimited(clientIP, 5, 15 * 60 * 1000)) {
            console.warn(`Rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).json(ApiResponse.error(
                'Too many login attempts. Please try again later.',
                429
            ));
        }

        // Parse and validate request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { email, password } = RequestValidator.validateLoginRequest(body);

        console.log(`Login attempt for email: ${email}`);

        // Authenticate user
        const user = await authManager.authenticateUser(email, password);
        
        if (!user) {
            console.warn(`Login failed for email: ${email}`);
            return res.status(401).json(ApiResponse.error(
                'Invalid email or password',
                401
            ));
        }

        // Generate authentication token
        const token = authManager.generateAuthToken(user);

        console.log(`Login successful for user: ${user.email}`);

        // Return success response
        return res.status(200).json(ApiResponse.success({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token,
            expiresIn: '24h'
        }, 'Login successful'));

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(400).json(ApiResponse.error(
            error.message,
            400
        ));
    }
}

/**
 * Token Refresh Endpoint
 * POST /api/refresh
 */
async function handleRefresh(req, res) {
    try {
        // Parse and validate request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { refreshToken } = RequestValidator.validateRefreshRequest(body);

        // Verify the refresh token (same as auth token in this simplified implementation)
        const payload = authManager.verifyAuthToken(refreshToken);
        
        if (!payload) {
            return res.status(401).json(ApiResponse.error(
                'Invalid or expired refresh token',
                401
            ));
        }

        // Generate new token
        const newToken = authManager.generateAuthToken({
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role
        });

        console.log(`Token refreshed for user: ${payload.email}`);

        return res.status(200).json(ApiResponse.success({
            token: newToken,
            expiresIn: '24h'
        }, 'Token refreshed successfully'));

    } catch (error) {
        console.error('Token refresh error:', error.message);
        return res.status(400).json(ApiResponse.error(
            error.message,
            400
        ));
    }
}

/**
 * User Registration Endpoint (for testing)
 * POST /api/register
 */
async function handleRegister(req, res) {
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        
        // Basic validation
        if (!body.email || !body.password || !body.name) {
            return res.status(400).json(ApiResponse.error(
                'Email, password, and name are required',
                400
            ));
        }

        const email = body.email.trim().toLowerCase();
        
        // Check if user already exists
        if (authManager.users.has(email)) {
            return res.status(409).json(ApiResponse.error(
                'User with this email already exists',
                409
            ));
        }

        // Create new user
        const newUser = {
            id: `user_${Date.now()}`,
            email,
            password: authManager.hashPassword(body.password),
            name: body.name.trim(),
            role: 'user',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        // Store user (in production, save to database)
        authManager.users.set(email, newUser);

        // Generate token
        const token = authManager.generateAuthToken(newUser);

        console.log(`User registered: ${email}`);

        return res.status(201).json(ApiResponse.success({
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            },
            token,
            expiresIn: '24h'
        }, 'User registered successfully'));

    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(400).json(ApiResponse.error(
            error.message,
            400
        ));
    }
}

/**
 * Health Check Endpoint
 * GET /api/health
 */
function handleHealthCheck(req, res) {
    return res.status(200).json(ApiResponse.success({
        status: 'healthy',
        service: 'designfitout-mobile-auth',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    }, 'Service is healthy'));
}

/**
 * Authentication Middleware
 * Validates JWT token in requests
 */
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json(ApiResponse.error(
                'Authorization header is required',
                401
            ));
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = authManager.verifyAuthToken(token);
        
        if (!payload) {
            return res.status(401).json(ApiResponse.error(
                'Invalid or expired token',
                401
            ));
        }

        // Add user info to request
        req.user = payload;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json(ApiResponse.error(
            'Authentication failed',
            401
        ));
    }
}

/**
 * Protected Route Example
 * GET /api/profile
 */
function handleProfile(req, res) {
    return res.status(200).json(ApiResponse.success({
        user: req.user
    }, 'Profile retrieved successfully'));
}

/**
 * CORS Middleware
 */
function corsMiddleware(req, res, next) {
    // Get allowed origins from config or environment
    const allowedOrigins = [
        'https://fitoutlab.app',
        'https://www.fitoutlab.app',
        'https://designfitout.com',
        'https://www.designfitout.com',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:5000'
    ];

    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
}

/**
 * Cloud Function Exports
 * This exports functions for different cloud providers
 */

// Google Cloud Functions format
exports.mobileAuth = (req, res) => {
    // Apply CORS middleware
    corsMiddleware(req, res, () => {
        const path = req.path || req.url;
        const method = req.method;

        console.log(`${method} ${path} - Mobile Auth API`);

        // Route requests to appropriate handlers
        if (path === '/api/login' && method === 'POST') {
            return handleLogin(req, res);
        } else if (path === '/api/register' && method === 'POST') {
            return handleRegister(req, res);
        } else if (path === '/api/refresh' && method === 'POST') {
            return handleRefresh(req, res);
        } else if (path === '/api/health' && method === 'GET') {
            return handleHealthCheck(req, res);
        } else if (path === '/api/profile' && method === 'GET') {
            return authMiddleware(req, res, () => handleProfile(req, res));
        } else {
            return res.status(404).json(ApiResponse.error(
                'Endpoint not found',
                404
            ));
        }
    });
};

// AWS Lambda format
exports.handler = async (event, context) => {
    const req = {
        method: event.httpMethod,
        path: event.path,
        headers: event.headers,
        body: event.body
    };

    const res = {
        statusCode: 200,
        headers: {},
        body: '',
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) { this.body = JSON.stringify(data); return this; },
        setHeader: function(name, value) { this.headers[name] = value; }
    };

    return new Promise((resolve) => {
        // Apply CORS and routing
        corsMiddleware(req, res, () => {
            const path = req.path;
            const method = req.method;

            if (path === '/api/login' && method === 'POST') {
                handleLogin(req, res).then(() => resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: res.body
                }));
            } else if (path === '/api/health' && method === 'GET') {
                handleHealthCheck(req, res);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: res.body
                });
            }
            // Add other routes as needed
        });
    });
};

// Export individual functions for testing
exports.authManager = authManager;
exports.TokenManager = TokenManager;
exports.ApiResponse = ApiResponse;
exports.RequestValidator = RequestValidator;

console.log('🚀 Designfitout Mobile Authentication API initialized');