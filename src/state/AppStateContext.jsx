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
      toggleHeart,
      toggleSave,
      copyArticleLink,
    }),
    [heartedIds, lastCopiedSlug, savedIds],
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
