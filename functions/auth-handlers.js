/**
 * Authentication Handlers for Designfitout-Github
 * Cloud-agnostic authentication API with JWT support
 */

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-key-change-in-production';
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 5;
const DATABASE_URL = process.env.DATABASE_URL || 'memory://local';

// Simple in-memory storage for demo (replace with real database in production)
const users = new Map();
const rateLimitStore = new Map();

/**
 * Simple JWT implementation (replace with a proper library in production)
 */
const jwt = {
  sign: (payload, secret) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },
  
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
 * Rate limiting helper
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const attempts = rateLimitStore.get(identifier).filter(time => time > windowStart);
  
  if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((attempts[0] + RATE_LIMIT_WINDOW - now) / 1000) };
  }
  
  attempts.push(now);
  rateLimitStore.set(identifier, attempts);
  
  return { allowed: true };
}

/**
 * User registration handler
 */
async function handleRegister(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // Basic validation
    if (!email || !password || !name) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: email, password, name'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check rate limiting
    const rateLimit = checkRateLimit(`register_${email}`);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: 'Too many registration attempts. Please try again later.',
        retryAfter: rateLimit.retryAfter
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user already exists
    if (users.has(email)) {
      return new Response(JSON.stringify({
        error: 'User already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create user (in production, hash password properly)
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: btoa(password), // Simple base64 encoding (use bcrypt in production)
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    users.set(email, user);
    
    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET);
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * User login handler
 */
async function handleLogin(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Basic validation
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: email, password'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check rate limiting
    const rateLimit = checkRateLimit(`login_${email}`);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        error: 'Too many login attempts. Please try again later.',
        retryAfter: rateLimit.retryAfter
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find user
    const user = users.get(email);
    if (!user || atob(user.password) !== password) {
      return new Response(JSON.stringify({
        error: 'Invalid credentials'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET);
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Token refresh handler
 */
async function handleRefresh(request) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return new Response(JSON.stringify({
        error: 'Missing token'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify existing token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const user = users.get(payload.email);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate new token
    const newTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const newToken = jwt.sign(newTokenPayload, JWT_SECRET);
    
    return new Response(JSON.stringify({
      success: true,
      token: newToken
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Refresh error:', error);
    return new Response(JSON.stringify({
      error: 'Invalid or expired token'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * User profile handler (protected endpoint)
 */
async function handleProfile(request) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Missing or invalid authorization header'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const user = users.get(payload.email);
    if (!user) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    return new Response(JSON.stringify({
      error: 'Invalid or expired token'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Health check handler for authentication service
 */
async function handleAuthHealth(request) {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'Designfitout Authentication API',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      refresh: '/api/auth/refresh',
      profile: '/api/profile',
      health: '/api/auth/health'
    },
    config: {
      rateLimitWindow: RATE_LIMIT_WINDOW,
      rateLimitMaxAttempts: RATE_LIMIT_MAX_ATTEMPTS,
      databaseUrl: DATABASE_URL === 'memory://local' ? 'memory://local' : 'configured'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

module.exports = {
  handleRegister,
  handleLogin,
  handleRefresh,
  handleProfile,
  handleAuthHealth,
  jwt // Export for testing
};