/**
 * Ops Snapshot Endpoint - Cloudflare Pages Function
 * 
 * This endpoint accepts POST requests to store operational snapshots
 * with HMAC-SHA256 signature authentication for security.
 * 
 * Authentication Methods (in order of preference):
 * 1. HMAC Signature: X-Signature + X-Timestamp headers
 * 2. Bearer Token: Authorization header (fallback for compatibility)
 * 
 * HMAC Signature Specification:
 * - Compute: HMAC-SHA256(secret, "${timestamp}.${body}")
 * - Headers: X-Signature (hex), X-Timestamp (ISO 8601 or epoch ms)
 * - Validation: Timestamp must be within 5 minutes (configurable)
 * - Comparison: Timing-safe to prevent timing attacks
 * 
 * Environment Variables:
 * - MRKETOZ_SHARED_SECRET: Shared secret for authentication (required)
 * - SNAPSHOT_KV: KV namespace binding for storage (required for POST)
 * 
 * Endpoints:
 * - GET  /ops/snapshot.json: Retrieve current snapshot
 * - POST /ops/snapshot.json: Store new snapshot (authenticated)
 */

// Type definitions for Cloudflare Pages Functions
interface Env {
  MRKETOZ_SHARED_SECRET?: string;
  SNAPSHOT_KV?: KVNamespace;
}

interface RequestContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}

// Configuration constants
const TIMESTAMP_SKEW_SECONDS = 300; // 5 minutes
const KV_KEY = 'ops-snapshot';

/**
 * Timing-safe string comparison to prevent timing attacks
 * Uses crypto.timingSafeEqual if available, otherwise JS implementation
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  // Convert hex strings to buffers for comparison
  const encoder = new TextEncoder();
  const bufferA = encoder.encode(a);
  const bufferB = encoder.encode(b);

  // Must be same length for valid comparison
  if (bufferA.length !== bufferB.length) {
    return false;
  }

  // Try to use native crypto.timingSafeEqual if available
  // In Cloudflare Workers/Pages, we use Web Crypto API
  try {
    // Use XOR comparison - all bits must match
    let result = 0;
    for (let i = 0; i < bufferA.length; i++) {
      result |= bufferA[i] ^ bufferB[i];
    }
    return result === 0;
  } catch (error) {
    console.error('Timing-safe comparison error:', error);
    return false;
  }
}

/**
 * Compute HMAC-SHA256 signature using Web Crypto API
 */
async function computeHMAC(
  secret: string,
  message: string
): Promise<string> {
  const encoder = new TextEncoder();
  
  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Sign the message
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Validate timestamp is within allowed skew window
 */
function isTimestampValid(timestamp: string): boolean {
  try {
    // Parse timestamp (support both ISO 8601 and epoch milliseconds)
    let timestampMs: number;
    
    if (/^\d+$/.test(timestamp)) {
      // Epoch milliseconds
      timestampMs = parseInt(timestamp, 10);
    } else {
      // ISO 8601 or other date format
      timestampMs = new Date(timestamp).getTime();
    }
    
    // Check if parsing was successful
    if (isNaN(timestampMs)) {
      return false;
    }
    
    // Check if timestamp is within allowed skew window
    const nowMs = Date.now();
    const skewMs = TIMESTAMP_SKEW_SECONDS * 1000;
    const diff = Math.abs(nowMs - timestampMs);
    
    return diff <= skewMs;
  } catch (error) {
    console.error('Timestamp validation error:', error);
    return false;
  }
}

/**
 * Verify HMAC signature from request headers
 */
async function verifyHMACSignature(
  request: Request,
  body: string,
  secret: string
): Promise<{ valid: boolean; reason?: string }> {
  // Extract headers
  const signature = request.headers.get('X-Signature');
  const timestamp = request.headers.get('X-Timestamp');
  
  // Check if HMAC headers are present
  if (!signature || !timestamp) {
    return { valid: false, reason: 'Missing X-Signature or X-Timestamp header' };
  }
  
  // Validate timestamp
  if (!isTimestampValid(timestamp)) {
    return { 
      valid: false, 
      reason: `Timestamp outside allowed window (${TIMESTAMP_SKEW_SECONDS}s)` 
    };
  }
  
  // Compute expected signature
  const message = `${timestamp}.${body}`;
  const expectedSignature = await computeHMAC(secret, message);
  
  // Compare signatures (timing-safe)
  const signaturesMatch = await timingSafeEqual(
    signature.toLowerCase(),
    expectedSignature.toLowerCase()
  );
  
  if (!signaturesMatch) {
    return { valid: false, reason: 'Invalid signature' };
  }
  
  return { valid: true };
}

/**
 * Verify Bearer token authentication (fallback)
 */
function verifyBearerToken(request: Request, secret: string): boolean {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return false;
  }
  
  // Extract Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return false;
  }
  
  const token = match[1];
  
  // Simple comparison (not timing-safe, but this is fallback auth)
  return token === secret;
}

/**
 * Authenticate request using HMAC or Bearer token
 */
async function authenticateRequest(
  request: Request,
  body: string,
  env: Env
): Promise<{ authenticated: boolean; reason?: string }> {
  const secret = env.MRKETOZ_SHARED_SECRET;
  
  // If no secret is configured, deny access
  if (!secret) {
    return { 
      authenticated: false, 
      reason: 'Server not configured for authentication' 
    };
  }
  
  // Try HMAC authentication first
  const hmacResult = await verifyHMACSignature(request, body, secret);
  if (hmacResult.valid) {
    return { authenticated: true };
  }
  
  // Try Bearer token fallback
  if (verifyBearerToken(request, secret)) {
    return { authenticated: true };
  }
  
  // Both methods failed
  return { 
    authenticated: false, 
    reason: hmacResult.reason || 'Invalid authentication credentials' 
  };
}

/**
 * Handle GET requests - retrieve current snapshot
 */
async function handleGet(env: Env): Promise<Response> {
  try {
    // Check if KV namespace is available
    if (!env.SNAPSHOT_KV) {
      // Return fallback empty snapshot
      return new Response(
        JSON.stringify({ 
          message: 'No snapshot available',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );
    }
    
    // Retrieve snapshot from KV
    const snapshot = await env.SNAPSHOT_KV.get(KV_KEY, 'text');
    
    if (!snapshot) {
      // No snapshot exists yet
      return new Response(
        JSON.stringify({ 
          message: 'No snapshot available',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );
    }
    
    // Return the snapshot
    return new Response(snapshot, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to retrieve snapshot'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle POST requests - store new snapshot
 */
async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    // Read request body
    const body = await request.text();
    
    // Authenticate request
    const authResult = await authenticateRequest(request, body, env);
    
    if (!authResult.authenticated) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: authResult.reason || 'Authentication failed'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate JSON payload
    let snapshot: any;
    try {
      snapshot = JSON.parse(body);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request',
          message: 'Invalid JSON payload'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if KV namespace is available
    if (!env.SNAPSHOT_KV) {
      return new Response(
        JSON.stringify({ 
          error: 'Service Unavailable',
          message: 'KV storage not configured'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add metadata
    const snapshotWithMetadata = {
      ...snapshot,
      _metadata: {
        stored_at: new Date().toISOString(),
        content_length: body.length
      }
    };
    
    // Store in KV
    await env.SNAPSHOT_KV.put(
      KV_KEY,
      JSON.stringify(snapshotWithMetadata),
      {
        metadata: {
          stored_at: new Date().toISOString(),
          size: body.length
        }
      }
    );
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Snapshot stored successfully',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error handling POST request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to store snapshot'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Main request handler - Cloudflare Pages Functions entry point
 */
export async function onRequest(context: RequestContext): Promise<Response> {
  const { request, env } = context;
  
  // Handle based on HTTP method
  if (request.method === 'GET') {
    return handleGet(env);
  } else if (request.method === 'POST') {
    return handlePost(request, env);
  } else {
    // Method not allowed
    return new Response(
      JSON.stringify({ 
        error: 'Method Not Allowed',
        message: 'Only GET and POST methods are supported'
      }),
      {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Allow': 'GET, POST'
        }
      }
    );
  }
}
