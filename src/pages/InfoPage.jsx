import { Link } from "react-router-dom";

export default function InfoPage() {
  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">Info</p>
        <h1>Built by someone who actually ships.</h1>
      </div>
      <div className="info-card">
        <p>
          William&apos;s Testbed is a weekly newsletter documenting real AI builds - what worked,
          what didn&apos;t, and how to apply it to your business.
        </p>
        <h2>Who&apos;s behind it</h2>
        <p>
          William has built production AI systems for clients most people only read about. An ML
          model guiding pedicle screw placement mid-surgery for a 10M+ biomedical startup. A
          RAG-based research curation agent for a 10B+ AUM investment firm. A quantitative trading
          framework that beat the S&amp;P 500 by 17% at a beta of 0.56. This isn&apos;t commentary on AI
          - it&apos;s fieldwork.
        </p>
        <h2>What you get</h2>
        <p>
          Every issue breaks down one real AI development, one concrete way to apply it to a
          business process this week, and a look at what&apos;s currently running on the testbed. No
          aggregation. No hype. Just what&apos;s actually working.
        </p>
        <h2>Who it&apos;s for</h2>
        <p>
          Business owners and operators who want to use AI to make money - not founders who want to
          talk about it.
        </p>
        <p>
          Need this built for your business? <Link to="/work-with-me">Work with me -&gt;</Link>
        </p>
      </div>
    </section>
  );
}
