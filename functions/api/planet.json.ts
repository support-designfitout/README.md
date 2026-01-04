// “current planet touch” — owner-approved stance visible in the dashboard.
export const onRequestGet: PagesFunction = async () => {
  const note = [
    "MCP not required for the app at launch; useful later for backend APIs.",
    "Cloudflare-first stack: Workers/Pages/D1/R2/Queues.",
    "Use Hyperdrive -> PlanetScale when read-heavy paths appear.",
    "Start on D1 for simplicity/cost; re-evaluate post-live traffic.",
    "Automations (ingress/dispatcher/audit) only on owner signal."
  ].join("\n• ");

  return new Response(JSON.stringify({ note: "• " + note }), {
    headers: { "content-type": "application/json" }
  });
};