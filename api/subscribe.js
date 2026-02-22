const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIRST_NAME_REGEX = /^[A-Za-z][A-Za-z '-]{0,49}$/;
const USER_EXISTS_MESSAGES = ["already registered", "already been registered", "user already exists"];
const DEFAULT_SUBSCRIBE_ERROR = "Could not save your email right now.";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Server is not configured." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const firstName = String(body.firstName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!FIRST_NAME_REGEX.test(firstName)) {
      return res.status(400).json({ error: "Please enter a valid first name." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        create_user: true,
        data: {
          first_name: firstName,
        },
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      let parsedBody = null;

      try {
        parsedBody = JSON.parse(responseBody);
      } catch {
        parsedBody = null;
      }

      const upstreamMessage = String(
        parsedBody?.msg || parsedBody?.error_description || parsedBody?.error || responseBody || ""
      ).trim();
      const loweredBody = `${responseBody} ${upstreamMessage}`.toLowerCase();
      const isDuplicate = USER_EXISTS_MESSAGES.some((message) => loweredBody.includes(message));

      if (isDuplicate) {
        return res.status(409).json({ error: "This email is already registered." });
      }

      const statusCode = response.status >= 400 && response.status < 500 ? response.status : 500;
      const safeMessage = upstreamMessage || DEFAULT_SUBSCRIBE_ERROR;

      return res.status(statusCode).json({ error: safeMessage });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: DEFAULT_SUBSCRIBE_ERROR });
  }
};
