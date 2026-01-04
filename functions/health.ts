/**
 * System Heartbeat Function
 * Cloud-agnostic health check endpoint for serverless platforms
 * Compatible with: Google Cloud Functions, AWS Lambda, Azure Functions, Cloudflare Pages
 */

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  timestamp: string;
  uptime?: number;
  pages: Array<{
    url: string;
    path: string;
    status: 'active' | 'inactive';
    description: string;
  }>;
  features: string[];
  domains: {
    primary: string;
    secondary: string;
  };
  cache: {
    enabled: boolean;
    maxAge: number;
  };
  environment?: {
    runtime?: string;
    region?: string;
  };
}

export interface HealthCheckRequest {
  headers?: Record<string, string>;
  method?: string;
  url?: string;
}

/**
 * Generate current health status
 */
export function generateHealthStatus(): HealthCheckResponse {
  return {
    status: 'healthy',
    service: 'Designfitout Static Pages Health Check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : undefined,
    pages: [
      {
        url: '/',
        path: '/index.html',
        status: 'active',
        description: 'Main landing page with video integration',
      },
      {
        url: '/ind2x.html',
        path: '/ind2x.html',
        status: 'active',
        description: 'FitOutLab capsule interface',
      },
    ],
    features: [
      'Video Integration',
      'Strategic Analysis',
      'Glassmorphism Design',
      'Responsive Layout',
    ],
    domains: {
      primary: 'fitoutlab.app',
      secondary: 'designfitout.com',
    },
    cache: {
      enabled: true,
      maxAge: 3600,
    },
    environment: {
      runtime: process.env.RUNTIME_ENV || 'serverless',
      region: process.env.DEPLOYMENT_REGION || 'auto',
    },
  };
}

/**
 * Health check handler for serverless platforms
 * Supports multiple cloud providers through unified interface
 */
export async function handleHealthCheck(
  request?: HealthCheckRequest
): Promise<HealthCheckResponse> {
  try {
    const healthData = generateHealthStatus();

    // Log health check request (optional)
    if (process.env.ENABLE_HEALTH_LOGGING === 'true') {
      console.log(`[Health Check] ${healthData.timestamp} - Status: ${healthData.status}`);
    }

    return healthData;
  } catch (error) {
    console.error('[Health Check] Error generating health status:', error);
    
    // Return degraded status on error
    return {
      status: 'degraded',
      service: 'Designfitout Static Pages Health Check',
      timestamp: new Date().toISOString(),
      pages: [],
      features: [],
      domains: {
        primary: 'fitoutlab.app',
        secondary: 'designfitout.com',
      },
      cache: {
        enabled: false,
        maxAge: 0,
      },
    };
  }
}

/**
 * Express/Connect middleware handler
 */
export async function healthCheckMiddleware(
  req: any,
  res: any
): Promise<void> {
  const healthData = await handleHealthCheck({
    headers: req.headers,
    method: req.method,
    url: req.url,
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(healthData.status === 'healthy' ? 200 : 503);
  res.json(healthData);
}

/**
 * Cloud Functions (Google Cloud) handler
 */
export async function healthCheckGCP(req: any, res: any): Promise<void> {
  await healthCheckMiddleware(req, res);
}

/**
 * AWS Lambda handler
 */
export async function healthCheckAWS(event: any, context: any): Promise<any> {
  const healthData = await handleHealthCheck({
    headers: event.headers,
    method: event.httpMethod,
    url: event.path,
  });

  return {
    statusCode: healthData.status === 'healthy' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
    body: JSON.stringify(healthData),
  };
}

/**
 * Azure Functions handler
 */
export async function healthCheckAzure(context: any, req: any): Promise<void> {
  const healthData = await handleHealthCheck({
    headers: req.headers,
    method: req.method,
    url: req.url,
  });

  context.res = {
    status: healthData.status === 'healthy' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
    body: healthData,
  };
}

/**
 * Edge/Pages handler (Cloudflare Workers, etc.)
 */
export async function healthCheckEdge(request?: Request): Promise<Response> {
  const healthData = await handleHealthCheck({
    headers: request ? Object.fromEntries(request.headers.entries()) : {},
    method: request?.method,
    url: request?.url,
  });

  return new Response(JSON.stringify(healthData), {
    status: healthData.status === 'healthy' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}

/**
 * Default export for serverless platforms
 */
export default handleHealthCheck;
