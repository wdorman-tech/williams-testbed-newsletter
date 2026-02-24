import { createSupabaseAuthClient } from "./supabase.js";
import { getAdminEmails } from "./env.js";

export async function requireAdminUser(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) {
    return { error: "Missing bearer token.", status: 401 };
  }

  const supabaseAuth = createSupabaseAuthClient();
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user?.email) {
    return { error: "Invalid auth token.", status: 401 };
  }

  const adminEmails = getAdminEmails();
  if (!adminEmails.length) {
    return { error: "NEWSLETTER_ADMIN_EMAILS is not configured.", status: 500 };
  }

  const normalizedEmail = data.user.email.toLowerCase();
  if (!adminEmails.includes(normalizedEmail)) {
    return { error: "You are not allowed to send newsletters.", status: 403 };
  }

  return { user: data.user, status: 200 };
}
