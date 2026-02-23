import SiteHeader from "./SiteHeader";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="noise-overlay" />
      <SiteHeader />
      <main className="page-content">{children}</main>
    </div>
  );
}
