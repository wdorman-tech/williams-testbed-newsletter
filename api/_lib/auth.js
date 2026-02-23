const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  if (!header.startsWith("Bearer ")) {
    return "";
  }
  return header.slice("Bearer ".length).trim();
}

async function getAuthUser(token) {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function supabaseRest(path, options = {}) {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return response;
}

async function getProfileByUserId(userId) {
  const response = await supabaseRest(`profiles?id=eq.${userId}&select=id,role,display_name,stripe_customer_id`, {
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }
  const rows = await response.json();
  return rows[0] || null;
}

async function requireAuth(req, res) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ error: "Missing auth token." });
      return null;
    }
    const user = await getAuthUser(token);
    if (!user?.id || !EMAIL_REGEX.test(user.email || "")) {
      res.status(401).json({ error: "Unauthorized." });
      return null;
    }
    const profile = await getProfileByUserId(user.id);
    return { user, profile };
  } catch {
    res.status(500).json({ error: "Server is not configured." });
    return null;
  }
}

async function requireAdmin(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) {
    return null;
  }
  if (auth.profile?.role !== "admin") {
    res.status(403).json({ error: "Admin access required." });
    return null;
  }
  return auth;
}

async function readJsonBody(req) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }
  return req.body || {};
}

module.exports = {
  getEnv,
  supabaseRest,
  requireAuth,
  requireAdmin,
  readJsonBody,
};
