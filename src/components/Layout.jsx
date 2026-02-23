import SiteHeader from "./SiteHeader";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-content">{children}</main>
    </div>
  );
}
