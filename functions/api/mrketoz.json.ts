// Reads current pipeline snapshot from KV (editable without redeploy)
export const onRequestGet: PagesFunction<{ MRKETOZ_STATUS: KVNamespace }> = async (ctx) => {
  const raw = await ctx.env.MRKETOZ_STATUS.get("current");
  if (raw) return new Response(raw, { headers: { "content-type": "application/json" }});
  // sensible defaults if KV empty
  const fallback = {
    stage: "idle",
    branch: "main",
    short_sha: "-",
    last_pr: 39,
    last_pr_title: "OPEN PULL R",
    flags: ["public-site"],
    updated_at: new Date().toISOString()
  };
  return new Response(JSON.stringify(fallback), { headers: { "content-type": "application/json" }});
};