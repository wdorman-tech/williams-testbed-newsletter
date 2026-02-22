const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseTable = process.env.SUPABASE_TABLE || "newsletter_subscribers";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: "Server is not configured." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/${encodeURIComponent(supabaseTable)}?on_conflict=email`,
      {
        method: "POST",
        headers: {
          apikey: supabaseServiceRoleKey,
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify([{ email }]),
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Could not save your email right now." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Could not save your email right now." });
  }
};
