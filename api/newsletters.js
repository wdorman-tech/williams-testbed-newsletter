const { requireAuth, requireAdmin, readJsonBody, supabaseRest } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const auth = await requireAuth(req, res);
    if (!auth) {
      return;
    }

    const includeDrafts = req.query?.includeDrafts === "1" && auth.profile?.role === "admin";
    const filter = includeDrafts ? "" : "&status=eq.published";
    const response = await supabaseRest(
      `newsletters?select=id,title,slug,summary,content,status,sent_at,created_at&order=created_at.desc${filter}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Could not load newsletters." });
    }

    const newsletters = await response.json();
    return res.status(200).json({ newsletters });
  }

  if (req.method === "POST") {
    const auth = await requireAdmin(req, res);
    if (!auth) {
      return;
    }

    const body = await readJsonBody(req);
    const title = String(body.title || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    const summary = String(body.summary || "").trim();
    const content = String(body.content || "").trim();

    if (!title || !slug || !content) {
      return res.status(400).json({ error: "Title, slug, and content are required." });
    }

    const insertResponse = await supabaseRest("newsletters", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify([
        {
          title,
          slug,
          summary,
          content,
          status: "draft",
          created_by: auth.user.id,
          updated_by: auth.user.id,
        },
      ]),
    });

    if (!insertResponse.ok) {
      return res.status(500).json({ error: "Could not create newsletter." });
    }

    const rows = await insertResponse.json();
    return res.status(200).json({ newsletter: rows[0] || null });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed." });
};
