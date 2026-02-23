import Reveal from "../components/Reveal";

export default function InfoPage() {
  return (
    <section className="page-stack">
      <Reveal>
        <div className="page-intro">
          <p className="eyebrow">Info</p>
          <h1>About Black Lily Accelerator</h1>
        </div>
      </Reveal>
      <Reveal delay={200}>
        <div className="info-card">
          <h2>Founder Profile</h2>
          <p>
            I help founders and teams redesign the way they operate by integrating practical AI
            systems into day-to-day workflows.
          </p>
          <h2>Credentials</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae faucibus tortor.
            Vivamus porta odio at nibh luctus egestas.
          </p>
          <h2>Company Focus</h2>
          <p>
            Black Lily Accelerator partners with companies to modernize operations, remove bottlenecks,
            and keep teams at the leading edge through structured AI adoption.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
