import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <section className="grid-two">
      <article className="card reveal">
        <h2>Newsletter Archive</h2>
        <p>View all past editions and open each article.</p>
        <Link className="button" to="/archive">
          Open Archive
        </Link>
      </article>
      <article className="card reveal delay-1">
        <h2>My Tool Recommendations</h2>
        <p>See this week's AI tool recommendations.</p>
        <Link className="button" to="/my-tool-recommendations">
          Open Recommendations
        </Link>
      </article>
      <article className="card reveal delay-2">
        <h2>Settings</h2>
        <p>Edit your account settings.</p>
        <Link className="button" to="/settings">
          Edit Settings
        </Link>
      </article>
    </section>
  );
}
