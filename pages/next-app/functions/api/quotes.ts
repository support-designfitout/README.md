export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ env, request }) => {
  try {
    const url = new URL(request.url);
    const project = url.searchParams.get("project");
    if (!project || !project.trim()) {
      return json({ error: "Missing project parameter" }, 400);
    }

    const sql = `
      SELECT q.id, q.version, q.status, q.currency, q.total_amount, q.notes, q.created_at
      FROM quotes q
      WHERE q.project_id = (SELECT id FROM projects WHERE name = ? LIMIT 1)
      ORDER BY q.version DESC, q.created_at DESC
      LIMIT 1
    `;
    const { results } = await env.DB.prepare(sql).bind(project).all();

    return json(results ?? []);
  } catch (err: any) {
    return json({ error: String(err?.message || err) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
