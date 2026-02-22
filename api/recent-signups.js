const deriveNameFromEmail = (email) => {
  const localPart = String(email || "").split("@")[0] || "";
  const cleaned = localPart.replace(/[._-]+/g, " ").replace(/[^a-zA-Z0-9 ]/g, "").trim();
  return cleaned || "NEW USER";
};

const deriveNameFromUser = (user) => {
  const metadataFirstName = String(user?.user_metadata?.first_name || "").trim();
  if (metadataFirstName) {
    return metadataFirstName;
  }

  return deriveNameFromEmail(user?.email);
};

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: "Server is not configured." });
  }

  const requestHeaders = {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
  };

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: requestHeaders,
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Could not fetch recent signups." });
    }

    const payload = await response.json();
    const users = Array.isArray(payload.users) ? payload.users : [];
    const usersWithEmail = users.filter((user) => typeof user.email === "string" && user.email.trim());
    const sortedUsers = usersWithEmail.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    const names = sortedUsers
      .map((user) => deriveNameFromUser(user))
      .filter(Boolean)
      .slice(0, 12);

    const totalSignups = usersWithEmail.length;

    return res.status(200).json({ names, totalSignups });
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch recent signups." });
  }
};
