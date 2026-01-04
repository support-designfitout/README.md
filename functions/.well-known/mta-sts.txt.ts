/**
 * Cloudflare Pages Function for MTA-STS Policy
 * Serves the MTA-STS policy at /.well-known/mta-sts.txt
 * 
 * MTA-STS (Mail Transfer Agent Strict Transport Security) enforces
 * TLS encryption for email delivery to designfitout.com domain.
 */

interface Env {
  // Environment bindings can be added here if needed
}

/**
 * Handle GET requests for MTA-STS policy
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Only serve MTA-STS policy at the exact path
  if (url.pathname === '/.well-known/mta-sts.txt') {
    // MTA-STS policy for designfitout.com
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
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  // Health check fallback for other paths under .well-known
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'MTA-STS policy server',
      available_endpoints: ['/.well-known/mta-sts.txt']
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};
