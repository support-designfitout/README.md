/**
 * Cloudflare Pages Function for MTA-STS Policy
 * 
 * This function serves the MTA-STS policy at /.well-known/mta-sts.txt
 * MTA-STS (Mail Transfer Agent Strict Transport Security) helps prevent
 * man-in-the-middle attacks during email delivery by enforcing TLS.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8461
 */

export async function onRequestGet(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  
  // Only serve the policy if the path exactly matches
  if (url.pathname === '/.well-known/mta-sts.txt') {
    const policy = `version: STSv1
mode: enforce
mx: *.gmail.com
mx: *.google.com
max_age: 86400`;

    return new Response(policy, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=86400',
      },
    });
  }
  
  // Return 404 for any other path
  return new Response('Not found', {
    status: 404,
    headers: {
      'content-type': 'text/plain',
    },
  });
}
