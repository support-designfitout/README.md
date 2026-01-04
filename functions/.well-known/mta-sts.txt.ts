/**
 * Cloudflare Pages Function to serve MTA-STS policy
 * 
 * MTA-STS (Mail Transfer Agent Strict Transport Security) ensures email
 * is sent over secure TLS connections to prevent man-in-the-middle attacks.
 * 
 * This function serves the policy file at /.well-known/mta-sts.txt
 * as required by RFC 8461.
 */

interface Env {
  // Add any environment variables here if needed
}

type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Promise<Response> | Response;

/**
 * MTA-STS policy content
 * - version: STSv1 (current MTA-STS version)
 * - mode: enforce (reject emails that don't meet policy)
 * - mx: Mail servers that must be used
 * - max_age: How long to cache policy (86400 = 24 hours)
 */
const MTA_STS_POLICY = `version: STSv1
mode: enforce
mx: *.gmail.com
mx: *.google.com
max_age: 86400
`;

/**
 * Handle GET requests for MTA-STS policy
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  
  // Only respond to exact path /.well-known/mta-sts.txt
  if (url.pathname !== '/.well-known/mta-sts.txt') {
    return new Response('Not found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  // Return the MTA-STS policy with appropriate headers
  return new Response(MTA_STS_POLICY, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
};
