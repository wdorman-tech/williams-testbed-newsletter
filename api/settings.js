const { requireAuth, readJsonBody, supabaseRest } = require("./_lib/auth");

module.exports = async (req, res) => {
  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  if (req.method === "GET") {
    const response = await supabaseRest(
      `profiles?id=eq.${auth.user.id}&select=id,display_name,weekly_digest_enabled&limit=1`
    );
    if (!response.ok) {
      return res.status(500).json({ error: "Could not load settings." });
    }
    const rows = await response.json();
    return res.status(200).json({ settings: rows[0] || null });
  }

  if (req.method === "PATCH") {
    const body = await readJsonBody(req);
    const displayName = String(body.displayName || "").trim();
    const weeklyDigestEnabled = Boolean(body.weeklyDigestEnabled);

    const response = await supabaseRest(`profiles?id=eq.${auth.user.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        display_name: displayName,
        weekly_digest_enabled: weeklyDigestEnabled,
      }),
    });
    if (!response.ok) {
      return res.status(500).json({ error: "Could not update settings." });
    }
    const rows = await response.json();
    return res.status(200).json({ settings: rows[0] || null });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed." });
};
