/**
 * Edge Cache Worker
 * Cloud-agnostic edge caching implementation
 * 
 * This worker can be deployed to:
 * - Cloudflare Workers
 * - AWS Lambda@Edge
 * - Azure Edge Functions
 * - Other edge computing platforms
 */

/**
 * Handle incoming requests with edge caching logic
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables and bindings
 * @returns {Response} - The cached or fetched response
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  // Cache key generation
  const cacheKey = new Request(url.toString(), request);
  
  // Try to get from cache (if caching interface is available)
  let response;
  
  try {
    // For environments with Cache API (Cloudflare, etc.)
    if (typeof caches !== 'undefined') {
      const cache = caches.default;
      response = await cache.match(cacheKey);
      
      if (response) {
        // Add cache hit header
        const newHeaders = new Headers(response.headers);
        newHeaders.set('X-Cache-Status', 'HIT');
        newHeaders.set('X-Cache-Age', Math.floor((Date.now() - new Date(response.headers.get('date')).getTime()) / 1000));
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }
    }
  } catch (error) {
    console.error('Cache lookup error:', error);
  }
  
  // Fetch from origin
  response = await fetch(request);
  
  // Cache the response if appropriate
  if (response.ok && request.method === 'GET') {
    try {
      const cacheControl = response.headers.get('Cache-Control');
      const shouldCache = !cacheControl || !cacheControl.includes('no-cache');
      
      if (shouldCache && typeof caches !== 'undefined') {
        // Clone the response for caching
        const responseToCache = response.clone();
        const cache = caches.default;
        
        // Add cache headers
        const newHeaders = new Headers(responseToCache.headers);
        newHeaders.set('X-Cache-Status', 'MISS');
        newHeaders.set('Cache-Control', cacheControl || 'public, max-age=3600');
        
        const cachedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: newHeaders
        });
        
        // Store in cache
        await cache.put(cacheKey, cachedResponse);
      }
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }
  
  // Add cache miss header to response
  const finalHeaders = new Headers(response.headers);
  finalHeaders.set('X-Cache-Status', 'MISS');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: finalHeaders
  });
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

// AWS Lambda@Edge format
export const handler = async (event) => {
  const request = event.Records[0].cf.request;
  return handleRequest(request, {});
};

// Standard module export for other platforms
// Removed CommonJS export to avoid mixing module systems.
