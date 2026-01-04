/**
 * Middleware for Designfitout-Github Authentication
 * Role-based access control and request validation
 */

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-key-change-in-production';

/**
 * Simple JWT implementation (should match auth-handlers.js)
 */
const jwt = {
  verify: (token, secret) => {
    try {
      const [header, payload, signature] = token.split('.');
      const expectedSignature = btoa(`${header}.${payload}.${secret}`);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      return JSON.parse(atob(payload));
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

/**
 * Middleware to require authenticated user
 * Verifies JWT token and attaches user info to request
 */
function requireUser(handler) {
  return async function(request, ...args) {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          error: 'Authentication required',
          message: 'Missing or invalid authorization header'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const token = authHeader.substring(7);
      
      // Verify token
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Invalid token',
          message: 'Token verification failed'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check token expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return new Response(JSON.stringify({
          error: 'Token expired',
          message: 'Please refresh your token or login again'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Attach user info to request (in a real implementation, you'd use a proper way to pass this)
      request.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
      
      // Call the original handler
      return await handler(request, ...args);
      
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return new Response(JSON.stringify({
        error: 'Authentication failed',
        message: 'Internal server error during authentication'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

/**
 * Middleware to require specific role
 */
function requireRole(requiredRole) {
  return function(handler) {
    return requireUser(async function(request, ...args) {
      if (request.user.role !== requiredRole) {
        return new Response(JSON.stringify({
          error: 'Insufficient permissions',
          message: `Required role: ${requiredRole}, current role: ${request.user.role}`
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return await handler(request, ...args);
    });
  };
}

/**
 * Middleware to require admin role
 */
function requireAdmin(handler) {
  return requireRole('admin')(handler);
}

/**
 * CORS middleware with configurable origins
 */
function cors(options = {}) {
  const {
    origins = ['https://designfitout.com', 'https://fitoutlab.app', 'https://www.designfitout.com', 'https://www.fitoutlab.app'],
    methods = 'GET, POST, PUT, DELETE, OPTIONS',
    headers = 'Content-Type, Authorization, X-Requested-With',
    maxAge = '86400'
  } = options;
  
  return function(handler) {
    return async function(request, ...args) {
      const origin = request.headers.get('origin');
      const allowedOrigin = origins.includes('*') ? '*' : 
        (origins.includes(origin) ? origin : origins[0]);
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': headers,
        'Access-Control-Max-Age': maxAge,
        'Access-Control-Allow-Credentials': 'true'
      };
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }
      
      // Call the original handler
      const response = await handler(request, ...args);
      
      // Add CORS headers to response
      const responseHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    };
  };
}

/**
 * Rate limiting middleware (simplified version)
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // max requests per window
    keyGenerator = (request) => request.headers.get('x-forwarded-for') || 'anonymous'
  } = options;
  
  const store = new Map();
  
  return function(handler) {
    return async function(request, ...args) {
      const key = keyGenerator(request);
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Get or create request history for this key
      if (!store.has(key)) {
        store.set(key, []);
      }
      
      const requests = store.get(key).filter(time => time > windowStart);
      
      if (requests.length >= max) {
        return new Response(JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((requests[0] + windowMs - now) / 1000).toString()
          }
        });
      }
      
      // Add current request time and update store
      requests.push(now);
      store.set(key, requests);
      
      return await handler(request, ...args);
    };
  };
}

/**
 * Compose multiple middlewares
 */
function compose(...middlewares) {
  return function(handler) {
    return middlewares.reduceRight((next, middleware) => middleware(next), handler);
  };
}

module.exports = {
  requireUser,
  requireRole,
  requireAdmin,
  cors,
  rateLimit,
  compose
};