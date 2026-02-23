const { requireAuth, requireAdmin, readJsonBody, supabaseRest } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const auth = await requireAuth(req, res);
    if (!auth) {
      return;
    }

    const isAdminRead = req.query?.admin === "1" && auth.profile?.role === "admin";
    const query = isAdminRead
      ? "tool_recommendations?select=id,title,week_of,content,updated_at&order=week_of.desc&limit=1"
      : "tool_recommendations?select=id,title,week_of,content,updated_at&order=week_of.desc&limit=1&is_published=eq.true";
    const response = await supabaseRest(query);

    if (!response.ok) {
      return res.status(500).json({ error: "Could not load recommendations." });
    }

    const rows = await response.json();
    return res.status(200).json({ recommendation: rows[0] || null });
  }

  if (req.method === "PUT") {
    const auth = await requireAdmin(req, res);
    if (!auth) {
      return;
    }

    const body = await readJsonBody(req);
    const title = String(body.title || "").trim();
    const weekOf = String(body.weekOf || "").trim();
    const content = String(body.content || "").trim();
    if (!title || !weekOf || !content) {
      return res.status(400).json({ error: "Title, week, and content are required." });
    }

    const upsertResponse = await supabaseRest("tool_recommendations?on_conflict=week_of", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          week_of: weekOf,
          title,
          content,
          is_published: true,
          updated_by: auth.user.id,
        },
      ]),
    });

    if (!upsertResponse.ok) {
      return res.status(500).json({ error: "Could not save recommendations." });
    }

    const rows = await upsertResponse.json();
    return res.status(200).json({ recommendation: rows[0] || null });
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed." });
};
