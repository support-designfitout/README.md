// KV-backed operational snapshot endpoint
// Handles GET (read) and POST (write) requests for ops telemetry

export const onRequestGet: PagesFunction<{ OPS_KV: KVNamespace }> = async (ctx) => {
  const raw = await ctx.env.OPS_KV.get("snapshot");
  if (raw) return new Response(raw, { headers: { "content-type": "application/json" }});
  
  // Fallback structure if KV is empty
  const fallback = {
    timestamp: new Date().toISOString(),
    status: "idle",
    metrics: {
      uptime_pct: 100,
      latency_ms: 0,
      error_count: 0
    },
    deployments: [],
    alerts: [],
    notes: "No operational data recorded yet"
  };
  
  return new Response(JSON.stringify(fallback, null, 2), { 
    headers: { "content-type": "application/json" }
  });
};

export const onRequestPost: PagesFunction<{ OPS_KV: KVNamespace }> = async (ctx) => {
  // Secure POST with shared secret
  const authHeader = ctx.request.headers.get("authorization");
  const expectedSecret = ctx.env.MRKETOZ_SHARED_SECRET;
  
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ 
      error: "Unauthorized",
      message: "Valid MRKETOZ_SHARED_SECRET required" 
    }), { 
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  
  try {
    const body = await ctx.request.json();
    const snapshot = {
      ...body,
      timestamp: new Date().toISOString(),
      updated_by: "ops-automation"
    };
    
    await ctx.env.OPS_KV.put("snapshot", JSON.stringify(snapshot, null, 2));
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Snapshot updated",
      timestamp: snapshot.timestamp
    }), { 
      headers: { "content-type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Invalid request",
      message: error instanceof Error ? error.message : "Failed to parse request body"
    }), { 
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
};
