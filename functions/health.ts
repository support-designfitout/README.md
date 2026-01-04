// Cloudflare Pages health endpoint
// Returns system health status including KV availability
export const onRequestGet: PagesFunction<{ MRKETOZ_STATUS?: KVNamespace }> = async (ctx) => {
  // Check KV availability
  let kvHealthy = true;
  try {
    if (ctx.env.MRKETOZ_STATUS) {
      // Use a lightweight KV operation to verify it's working
      await ctx.env.MRKETOZ_STATUS.list({ limit: 1 });
    }
  } catch (error) {
    kvHealthy = false;
  }

  const response = {
    ok: true,
    kv: kvHealthy,
    now: new Date().toISOString(),
    region: ctx.request.cf?.colo || "unknown"
  };

  return new Response(JSON.stringify(response), {
    headers: { "content-type": "application/json" }
  });
};
