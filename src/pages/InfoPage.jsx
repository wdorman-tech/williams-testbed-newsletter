export default function InfoPage() {
  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">Info</p>
        <h1>About William&apos;s Testbed</h1>
      </div>
      <div className="info-card">
        <h2>What This Is</h2>
        <p>
          William&apos;s Testbed is where I publish what I&apos;m working on each week so builders can
          learn from real implementation details, not theory.
        </p>
        <h2>Credentials</h2>
        <p>
          William has built production AI systems across high-stakes industries: an ML model for
          intraoperative pedicle screw placement at a 10M+ biomedical startup, a RAG-based
          research curation agent for a 10B+ AUM investment firm, and a quantitative trading
          framework integrating AI-driven qualitative scoring that achieved 17% outperformance over
          the S&amp;P 500 at a beta of 0.56. He doesn&apos;t write about AI from the sidelines - he
          has shipped real systems for real clients with real money on the line. That&apos;s the
          credential most AI newsletter writers can&apos;t claim.
        </p>
        <h2>Publishing Focus</h2>
        <p>
          Every post documents practical workflows, experiments, and decisions from active work in
          production environments.
        </p>
      </div>
    </section>
  );
}
