export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getAdminEmails() {
  const raw = process.env.NEWSLETTER_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getSiteUrl() {
  const configured = process.env.NEWSLETTER_SITE_URL || process.env.VITE_SITE_URL || "";
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:5173";
}
