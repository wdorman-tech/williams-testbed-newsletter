import SiteHeader from "./SiteHeader";
import ThemeDockButton from "./ThemeDockButton";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="page-content">{children}</main>
      <ThemeDockButton />
    </div>
  );
}
