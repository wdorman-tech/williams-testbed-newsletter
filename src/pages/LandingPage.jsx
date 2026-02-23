import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="card">
      <p className="eyebrow">MEMBERS ONLY</p>
      <h1>What's running on my testbed this week.</h1>
      <p>
        Login to access the full newsletter archive, weekly AI tool recommendations, and your
        account dashboard.
      </p>
      <div className="button-row">
        <Link className="button primary" to="/login">
          Login
        </Link>
      </div>
    </section>
  );
}
