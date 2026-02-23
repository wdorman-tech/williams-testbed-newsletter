import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/apiClient";

export default function DashboardPage() {
  const [billingMessage, setBillingMessage] = useState("");

  const openBillingPortal = async () => {
    setBillingMessage("");

    try {
      const response = await apiFetch("/api/create-portal-session", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not open billing portal.");
      }
      window.location.href = data.url;
    } catch (error) {
      setBillingMessage(error.message || "Could not open billing portal.");
    }
  };

  return (
    <section className="grid-two">
      <article className="card">
        <h2>Newsletter Archive</h2>
        <p>View all past editions and open each article.</p>
        <Link className="button" to="/archive">
          Open Archive
        </Link>
      </article>
      <article className="card">
        <h2>My Tool Recommendations</h2>
        <p>See this week's AI tool recommendations.</p>
        <Link className="button" to="/my-tool-recommendations">
          Open Recommendations
        </Link>
      </article>
      <article className="card">
        <h2>Billing</h2>
        <p>View card and update payment details in Stripe Customer Portal.</p>
        <button className="button" type="button" onClick={openBillingPortal}>
          Manage Payment Info
        </button>
        {billingMessage && <p className="message">{billingMessage}</p>}
      </article>
      <article className="card">
        <h2>Settings</h2>
        <p>Edit your account settings.</p>
        <Link className="button" to="/settings">
          Edit Settings
        </Link>
      </article>
    </section>
  );
}
