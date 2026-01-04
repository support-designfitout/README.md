/**
 * Cloudflare Pages Function: MTA-STS Policy
 * 
 * Serves the MTA-STS (Mail Transfer Agent Strict Transport Security) policy
 * at /.well-known/mta-sts.txt
 * 
 * MTA-STS is a security standard that helps prevent man-in-the-middle attacks
 * by ensuring email is always delivered over TLS to specified mail servers.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8461
 */

export const onRequestGet: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  
  // Only serve the policy at the exact path
  if (url.pathname !== '/.well-known/mta-sts.txt') {
    // Health check fallback for monitoring
    return new Response(
      JSON.stringify({
        status: 'ok',
        service: 'mta-sts-policy',
        path: url.pathname,
        expected_path: '/.well-known/mta-sts.txt'
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  // MTA-STS Policy for designfitout.com
  // Using Google Workspace MX servers
  const policy = `version: STSv1
mode: enforce
mx: aspmx.l.google.com
mx: alt1.aspmx.l.google.com
mx: alt2.aspmx.l.google.com
mx: alt3.aspmx.l.google.com
mx: alt4.aspmx.l.google.com
max_age: 86400`;
  
  return new Response(policy, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache for 1 day (matches max_age in policy)
      'Cache-Control': 'public, max-age=86400, immutable',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  });
};
