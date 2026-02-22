const deriveNameFromEmail = (email) => {
  const localPart = String(email || "").split("@")[0] || "";
  const cleaned = localPart.replace(/[._-]+/g, " ").replace(/[^a-zA-Z0-9 ]/g, "").trim();
  return cleaned || "NEW USER";
};

const getTotalSignups = async (supabaseUrl, supabaseTable, requestHeaders) => {
  const countResponse = await fetch(
    `${supabaseUrl}/rest/v1/${encodeURIComponent(supabaseTable)}?select=email&limit=1`,
    {
      headers: {
        ...requestHeaders,
        Prefer: "count=exact",
      },
    }
  );

  if (!countResponse.ok) {
    return null;
  }

  const contentRange = countResponse.headers.get("content-range") || "";
  const total = Number(contentRange.split("/")[1]);

  return Number.isFinite(total) ? total : null;
};

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseTable = process.env.SUPABASE_TABLE || "newsletter_subscribers";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: "Server is not configured." });
  }

  const requestHeaders = {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
  };

  try {
    let response = await fetch(
      `${supabaseUrl}/rest/v1/${encodeURIComponent(
        supabaseTable
      )}?select=email&order=created_at.desc.nullslast&limit=12`,
      { headers: requestHeaders }
    );

    if (!response.ok) {
      response = await fetch(
        `${supabaseUrl}/rest/v1/${encodeURIComponent(supabaseTable)}?select=email&limit=12`,
        { headers: requestHeaders }
      );
    }

    if (!response.ok) {
      return res.status(500).json({ error: "Could not fetch recent signups." });
    }

    const rows = await response.json();
    const names = rows
      .map((row) => deriveNameFromEmail(row.email))
      .filter(Boolean)
      .slice(0, 12);

    const totalSignups = await getTotalSignups(supabaseUrl, supabaseTable, requestHeaders);

    return res.status(200).json({ names, totalSignups });
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch recent signups." });
  }
};
