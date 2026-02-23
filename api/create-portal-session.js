const { getEnv, requireAuth } = require("./_lib/auth");

async function createStripePortalSession(customerId) {
  const stripeSecret = getEnv("STRIPE_SECRET_KEY");
  const returnUrl = getEnv("BILLING_RETURN_URL");

  const body = new URLSearchParams();
  body.append("customer", customerId);
  body.append("return_url", returnUrl);

  const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
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

  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  if (!auth.profile?.stripe_customer_id) {
    return res.status(400).json({ error: "No Stripe customer is linked to this account yet." });
  }

  try {
    const session = await createStripePortalSession(auth.profile.stripe_customer_id);
    if (!session?.url) {
      return res.status(500).json({ error: "Could not create Stripe portal session." });
    }
    return res.status(200).json({ url: session.url });
  } catch {
    return res.status(500).json({ error: "Could not create Stripe portal session." });
  }
};
