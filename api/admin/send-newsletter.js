const { getEnv, readJsonBody, requireAdmin, supabaseRest } = require("../_lib/auth");

async function sendWithResend({ to, subject, html }) {
  const resendApiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("RESEND_FROM_EMAIL");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const auth = await requireAdmin(req, res);
  if (!auth) {
    return;
  }

  try {
    const body = await readJsonBody(req);
    const newsletterId = String(body.newsletterId || "").trim();
    const subject = String(body.subject || "").trim();

    if (!newsletterId || !subject) {
      return res.status(400).json({ error: "newsletterId and subject are required." });
    }

    const newsletterResponse = await supabaseRest(
      `newsletters?id=eq.${newsletterId}&select=id,title,slug,summary,content,status`
    );
    if (!newsletterResponse.ok) {
      return res.status(500).json({ error: "Could not load newsletter to send." });
    }
    const newsletters = await newsletterResponse.json();
    const newsletter = newsletters[0];
    if (!newsletter?.id) {
      return res.status(404).json({ error: "Newsletter not found." });
    }

    const usersResponse = await supabaseRest("users?select=email");
    if (!usersResponse.ok) {
      return res.status(500).json({ error: "Could not load recipients." });
    }
    const users = await usersResponse.json();
    const recipients = users.map((row) => row.email).filter(Boolean);
    if (!recipients.length) {
      return res.status(400).json({ error: "No recipients found." });
    }

    const html = `
      <h1>${newsletter.title}</h1>
      <p>${newsletter.summary || ""}</p>
      <hr />
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${newsletter.content}</pre>
    `;

    const resendPayload = await sendWithResend({
      to: recipients,
      subject,
      html,
    });

    if (!resendPayload?.id) {
      return res.status(500).json({ error: "Resend send failed." });
    }

    const updateResponse = await supabaseRest(`newsletters?id=eq.${newsletter.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "published",
        sent_at: new Date().toISOString(),
        resend_message_id: resendPayload.id,
        updated_by: auth.user.id,
      }),
    });

    if (!updateResponse.ok) {
      return res.status(500).json({ error: "Sent email but failed to archive newsletter status." });
    }

    const updatedRows = await updateResponse.json();
    return res.status(200).json({
      ok: true,
      resendId: resendPayload.id,
      newsletter: updatedRows[0] || null,
    });
  } catch {
    return res.status(500).json({ error: "Could not send newsletter." });
  }
};
