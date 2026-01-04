// Store registrar snapshot in KV; update when you check Registrar tab
export const onRequestGet: PagesFunction<{ REGISTRAR_STATUS: KVNamespace }> = async (ctx) => {
  const raw = await ctx.env.REGISTRAR_STATUS.get("designfitout.com");
  if (!raw) {
    const stub = {
      domain: "designfitout.com",
      locked: true,
      dnssec: true,
      expires: "—",
      nameservers: ["—"]
    };
    return new Response(JSON.stringify(stub), { headers: { "content-type": "application/json" }});
  }
  return new Response(raw, { headers: { "content-type": "application/json" }});
};