/**
 * API Gateway Worker
 * Cloud-agnostic API gateway implementation
 * 
 * This worker can be deployed to:
 * - Cloudflare Workers
 * - AWS Lambda@Edge / API Gateway
 * - Azure Functions
 * - Google Cloud Functions
 * - Other serverless platforms
 */

/**
 * Route configuration for API endpoints
 */
const routes = {
  '/api/health': handleHealth,
  '/api/status': handleStatus,
  '/api/chat': handleChat,
  '/api/mrketoz': handleMrketOz
};

/**
 * CORS headers configuration
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

/**
 * Handle CORS preflight requests
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * Health check endpoint
 */
async function handleHealth(request, env) {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    version: env.VERSION || '1.0.0'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Status endpoint
 */
async function handleStatus(request, env) {
  return new Response(JSON.stringify({
    status: 'operational',
    uptime: (typeof process !== 'undefined' && typeof process.uptime === 'function') ? process.uptime() : 'N/A',
    endpoints: Object.keys(routes),
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Chat endpoint placeholder
 */
async function handleChat(request, env) {
  return new Response(JSON.stringify({
    message: 'Chat endpoint',
    note: 'This endpoint should integrate with MrketOz CRM',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * MrketOz CRM endpoint placeholder
 */
async function handleMrketOz(request, env) {
  return new Response(JSON.stringify({
    service: 'MrketOz CRM',
    status: 'active',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * 404 handler
 */
function handleNotFound(pathname) {
  return new Response(JSON.stringify({
    error: 'Not Found',
    message: `Endpoint ${pathname} not found`,
    availableEndpoints: Object.keys(routes)
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Error handler
 */
function handleError(error) {
  console.error('API Gateway Error:', error);
  
  return new Response(JSON.stringify({
    error: 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  }), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Main request handler
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  try {
    // Route to appropriate handler
    const handler = routes[pathname];
    
    if (handler) {
      return await handler(request, env);
    }
    
    // Check for dynamic routes (e.g., /api/chat/*)
    for (const route in routes) {
      if (pathname.startsWith(route)) {
        return await routes[route](request, env);
      }
    }
    
    // No matching route found
    return handleNotFound(pathname);
    
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Export handlers for different platforms
 */

// Cloudflare Workers format
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

// AWS Lambda format
export const handler = async (event, context) => {
  const request = {
    url: `https://${event.headers.Host}${event.path}`,
    method: event.httpMethod,
    headers: event.headers
  };
  
  const response = await handleRequest(request, {});
  
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text()
  };
};

// Standard module export for other platforms
export { handleRequest, routes };
