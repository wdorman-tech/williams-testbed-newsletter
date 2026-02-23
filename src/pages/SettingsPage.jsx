import Reveal from "../components/Reveal";

export default function SettingsPage() {
  return (
    <section className="page-stack">
      <Reveal>
        <div className="page-intro">
          <p className="eyebrow">Settings</p>
          <h1>Account Settings</h1>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="settings-card">
          <div className="setting-row">
            <p className="setting-label">Email</p>
            <p className="setting-value">you@example.com</p>
          </div>

          <div className="setting-row">
            <p className="setting-label">Newsletter</p>
            <button type="button" className="ghost-button">
              Unsubscribe
            </button>
          </div>

          <div className="setting-row">
            <p className="setting-label">Password</p>
            <button type="button" className="ghost-button">
              Change Password
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
