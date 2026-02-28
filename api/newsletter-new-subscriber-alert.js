import { requireEnv } from "./_lib/env.js";
import { sendNewSubscriberAlert } from "./_lib/sendNewsletter.js";

const ALERT_EMAIL = "wdorman26@gmail.com";

function getHeader(req, name) {
  const value = req.headers?.[name];
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return String(value || "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const expectedSecret = requireEnv("NEW_SUBSCRIBER_WEBHOOK_SECRET");
  const receivedSecret = getHeader(req, "x-newsletter-webhook-secret");
  if (!receivedSecret || receivedSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const subscriberEmail = normalizeEmail(req.body?.email);
  const insertedAt = String(req.body?.inserted_at || "");

  if (!subscriberEmail || !subscriberEmail.includes("@")) {
    return res.status(400).json({ error: "Invalid email." });
  }

  if (!insertedAt) {
    return res.status(400).json({ error: "inserted_at is required." });
  }

  const alertTo = process.env.NEW_SUBSCRIBER_ALERT_TO || ALERT_EMAIL;
  await sendNewSubscriberAlert({
    subscriberEmail,
    insertedAt,
    to: alertTo,
  });

  return res.status(200).json({ ok: true });
}
