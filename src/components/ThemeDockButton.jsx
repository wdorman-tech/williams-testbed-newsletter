import { useAppState } from "../state/AppStateContext";

export default function ThemeDockButton() {
  const { theme, toggleTheme } = useAppState();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className="theme-dock-button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? "☀" : "☾"}
    </button>
  );
}
