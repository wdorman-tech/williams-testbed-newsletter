const { requireAuth, requireAdmin, readJsonBody, supabaseRest } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const auth = await requireAuth(req, res);
    if (!auth) {
      return;
    }

    const slug = String(req.query?.slug || "").trim().toLowerCase();
    if (!slug) {
      return res.status(400).json({ error: "Missing slug." });
    }

    const response = await supabaseRest(
      `newsletters?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,title,slug,summary,content,sent_at,created_at`
    );
    if (!response.ok) {
      return res.status(500).json({ error: "Could not load newsletter." });
    }

    const rows = await response.json();
    return res.status(200).json({ newsletter: rows[0] || null });
  }

  if (req.method === "PATCH") {
    const auth = await requireAdmin(req, res);
    if (!auth) {
      return;
    }

    const body = await readJsonBody(req);
    const id = String(body.id || "").trim();
    if (!id) {
      return res.status(400).json({ error: "Missing newsletter id." });
    }

    const updatePayload = {
      title: String(body.title || "").trim(),
      slug: String(body.slug || "").trim().toLowerCase(),
      summary: String(body.summary || "").trim(),
      content: String(body.content || "").trim(),
      updated_by: auth.user.id,
    };

    const response = await supabaseRest(`newsletters?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Could not update newsletter." });
    }

    const rows = await response.json();
    return res.status(200).json({ newsletter: rows[0] || null });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed." });
};
