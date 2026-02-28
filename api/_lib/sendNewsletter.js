import { Resend } from "resend";
import { requireEnv } from "./env.js";

function chunk(list, size) {
  const output = [];
  for (let index = 0; index < list.length; index += size) {
    output.push(list.slice(index, index + size));
  }
  return output;
}

function createResendClient() {
  return new Resend(requireEnv("RESEND_API_KEY"));
}

export async function sendTestNewsletter({ to, subject, html }) {
  const resend = createResendClient();
  return resend.emails.send({
    from: requireEnv("NEWSLETTER_FROM_EMAIL"),
    to,
    subject: `[TEST] ${subject}`,
    html,
  });
}

export async function sendNewsletterToSubscribers({ subscribers, subject, html }) {
  const resend = createResendClient();
  const batches = chunk(subscribers, 50);
  let sentCount = 0;

  for (const batch of batches) {
    await resend.emails.send({
      from: requireEnv("NEWSLETTER_FROM_EMAIL"),
      to: batch,
      subject,
      html,
    });
    sentCount += batch.length;
  }

  return { sentCount };
}

export async function sendNewSubscriberAlert({ subscriberEmail, insertedAt, to }) {
  const resend = createResendClient();
  const timestamp = new Date(insertedAt);
  const safeTimestamp = Number.isNaN(timestamp.getTime()) ? String(insertedAt) : timestamp.toISOString();

  return resend.emails.send({
    from: requireEnv("NEWSLETTER_FROM_EMAIL"),
    to,
    subject: "New newsletter subscriber",
    html: `<p>A new newsletter subscriber was added.</p><p><strong>Email:</strong> ${subscriberEmail}</p><p><strong>Subscribed at:</strong> ${safeTimestamp}</p>`,
  });
}
