export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ env, request }) => {
  try {
    const url = new URL(request.url);
    const project = url.searchParams.get("project");
    if (!project || !project.trim()) {
      return json({ error: "Missing project parameter" }, 400);
    }

    const sql = `
      SELECT b.id, b.item_name, b.qty, b.unit, b.unit_price, b.currency, b.metadata_json,
             ROUND(b.qty * b.unit_price, 2) AS line_total
      FROM boq_items b
      WHERE b.project_id = (SELECT id FROM projects WHERE name = ? LIMIT 1)
      ORDER BY b.created_at ASC
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
