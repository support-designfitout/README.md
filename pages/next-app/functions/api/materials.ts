export const onRequest: PagesFunction<{ DB: D1Database }> = async ({ env, request }) => {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("search");
    if (!q || !q.trim()) {
      return json({ error: "Missing search parameter" }, 400);
    }

    const sql = `
      SELECT rowid, id, sku, name, category, brand, uom, tags
      FROM v_materials_search
      WHERE name MATCH ? OR tags MATCH ? OR brand MATCH ? OR category MATCH ?
      LIMIT 50
    `;
    const { results } = await env.DB.prepare(sql).bind(q, q, q, q).all();

    return json(results);
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
