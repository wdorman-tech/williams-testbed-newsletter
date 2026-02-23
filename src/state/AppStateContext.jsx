import { createContext, useContext, useMemo, useState } from "react";

const AppStateContext = createContext(null);

const initialHeartedIds = ["automation-backlog-triage", "content-loop-for-newsletters"];
const initialSavedIds = ["workflow-audit-playbook", "tool-stack-scorecard"];

function toSet(items) {
  return new Set(items);
}

export function AppStateProvider({ children }) {
  const [heartedIds, setHeartedIds] = useState(() => toSet(initialHeartedIds));
  const [savedIds, setSavedIds] = useState(() => toSet(initialSavedIds));
  const [lastCopiedSlug, setLastCopiedSlug] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) {
        return saved;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const toggleHeart = (articleId) => {
    setHeartedIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  };

  const toggleSave = (articleId) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  };

  const copyArticleLink = async (slug) => {
    const url = `${window.location.origin}/article/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setLastCopiedSlug(slug);
  };

  const value = useMemo(
    () => ({
      heartedIds,
      savedIds,
      lastCopiedSlug,
      theme,
      toggleHeart,
      toggleSave,
      copyArticleLink,
      toggleTheme,
    }),
    [heartedIds, lastCopiedSlug, savedIds, theme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
