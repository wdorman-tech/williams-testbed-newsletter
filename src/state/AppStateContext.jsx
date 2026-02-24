import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AppStateContext = createContext(null);

const LIST_TYPES = {
  favorite: "favorite",
  readLater: "read_later",
};

function toSet(items = []) {
  return new Set(items);
}

function getMessage(error, fallback) {
  if (error?.message) {
    return error.message;
  }
  return fallback;
}

function buildRedirectPath(path = "") {
  const basePath = import.meta.env.BASE_URL || "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${window.location.origin}${normalizedBase}${normalizedPath}`;
}

export function AppStateProvider({ children }) {
  const [heartedIds, setHeartedIds] = useState(() => toSet());
  const [heartCountsByArticleId, setHeartCountsByArticleId] = useState({});
  const [savedIds, setSavedIds] = useState(() => toSet());
  const [lastCopiedSlug, setLastCopiedSlug] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [articleIndex, setArticleIndex] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
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

  const isLoggedIn = Boolean(user);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const clearUserLists = useCallback(() => {
    setHeartedIds(toSet());
    setSavedIds(toSet());
  }, []);

  const loadAdminStatus = useCallback(async (userId) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(Boolean(data?.user_id));
  }, []);

  const loadArticleIndex = useCallback(async () => {
    const { data, error } = await supabase
      .from("article_index")
      .select(
        "slug, title, excerpt, category, author, published_at, read_minutes, trending, draft, is_private, hero_image, storage_path"
      )
      .order("published_at", { ascending: false });

    if (error) {
      setArticleIndex([]);
      return;
    }

    setArticleIndex(data || []);
  }, []);

  const refreshArticleCatalog = useCallback(async () => {
    await loadArticleIndex();
  }, [loadArticleIndex]);

  const loadUserLists = useCallback(async (userId) => {
    if (!userId) {
      clearUserLists();
      return;
    }

    setListsLoading(true);
    const { data, error } = await supabase
      .from("user_article_lists")
      .select("article_id, list_type")
      .eq("user_id", userId);

    if (error) {
      clearUserLists();
      setAuthMessage(
        getMessage(error, "Could not load your saved lists. Confirm your Supabase table is set up.")
      );
      setListsLoading(false);
      return;
    }

    const favoriteIds = data
      .filter((item) => item.list_type === LIST_TYPES.favorite)
      .map((item) => item.article_id);
    const readLaterIds = data
      .filter((item) => item.list_type === LIST_TYPES.readLater)
      .map((item) => item.article_id);

    setHeartedIds(toSet(favoriteIds));
    setSavedIds(toSet(readLaterIds));
    setListsLoading(false);
  }, [clearUserLists]);

  const [trendingArticles, setTrendingArticles] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const loadHeartCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("user_article_lists")
      .select("article_id")
      .eq("list_type", LIST_TYPES.favorite);

    if (error) {
      setHeartCountsByArticleId({});
      return;
    }

    const counts = (data || []).reduce((acc, curr) => {
      acc[curr.article_id] = (acc[curr.article_id] || 0) + 1;
      return acc;
    }, {});

    setHeartCountsByArticleId(counts);
  }, []);

  const loadTrendingArticles = useCallback(async () => {
    setTrendingLoading(true);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("user_article_lists")
      .select("article_id")
      .eq("list_type", LIST_TYPES.favorite)
      .gte("inserted_at", oneWeekAgo.toISOString());

    if (error) {
      setTrendingArticles([]);
      setTrendingLoading(false);
      return;
    }

    const counts = (data || []).reduce((acc, curr) => {
      acc[curr.article_id] = (acc[curr.article_id] || 0) + 1;
      return acc;
    }, {});

    const topIds = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    setTrendingArticles(topIds);
    setTrendingLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthMessage(getMessage(error, "Could not read your auth session."));
      }

      const nextSession = data?.session ?? null;
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);

      if (nextUser?.id) {
        await loadAdminStatus(nextUser.id);
        await loadUserLists(nextUser.id);
      } else {
        setIsAdmin(false);
        setArticleIndex([]);
        clearUserLists();
      }
      await refreshArticleCatalog();
      await loadTrendingArticles();
      await loadHeartCounts();

      if (isMounted) {
        setAuthLoading(false);
      }
    };

    void initializeAuth();

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (nextUser?.id) {
        void loadAdminStatus(nextUser.id);
        void loadUserLists(nextUser.id);
      } else {
        setIsAdmin(false);
        setArticleIndex([]);
        clearUserLists();
      }
      void refreshArticleCatalog();
      void loadTrendingArticles();
      void loadHeartCounts();

      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [
    clearUserLists,
    loadAdminStatus,
    loadUserLists,
    refreshArticleCatalog,
    loadTrendingArticles,
    loadHeartCounts,
  ]);

  const clearAuthMessage = useCallback(() => {
    setAuthMessage("");
  }, []);

  const signUpWithEmailPassword = useCallback(async (email, password) => {
    setAuthMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildRedirectPath(),
      },
    });

    if (error) {
      return { error: getMessage(error, "Could not create account.") };
    }

    return {
      success: true,
      message: "Check your email (and spam folder) to verify your account before logging in.",
    };
  }, []);

  const signInWithEmailPassword = useCallback(async (email, password) => {
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: getMessage(error, "Could not sign in.") };
    }

    return { success: true };
  }, []);

  const sendPasswordResetEmail = useCallback(async (email) => {
    setAuthMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildRedirectPath("reset-password"),
    });

    if (error) {
      return { error: getMessage(error, "Could not send password reset email.") };
    }

    return { success: true, message: "Password reset email sent. Check your inbox and spam folder." };
  }, []);

  const updatePassword = useCallback(async (nextPassword) => {
    setAuthMessage("");
    const { error } = await supabase.auth.updateUser({ password: nextPassword });

    if (error) {
      return { error: getMessage(error, "Could not update password.") };
    }

    return { success: true, message: "Password updated successfully." };
  }, []);

  const signOut = useCallback(async () => {
    setAuthMessage("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: getMessage(error, "Could not sign out.") };
    }
    return { success: true };
  }, []);

  const writeListItem = useCallback(async (articleId, listType, shouldAdd) => {
    if (!user?.id) {
      return { error: "Please log in first." };
    }

    if (shouldAdd) {
      const { error } = await supabase.from("user_article_lists").upsert(
        {
          user_id: user.id,
          article_id: articleId,
          list_type: listType,
        },
        {
          onConflict: "user_id,article_id,list_type",
        }
      );

      if (error) {
        return { error: getMessage(error, "Could not save list item.") };
      }
      return { success: true };
    }

    const { error } = await supabase
      .from("user_article_lists")
      .delete()
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .eq("list_type", listType);

    if (error) {
      return { error: getMessage(error, "Could not remove list item.") };
    }

    return { success: true };
  }, [user]);

  const toggleHeart = useCallback(async (articleId) => {
    const wasHearted = heartedIds.has(articleId);
    setHeartedIds((prev) => {
      const next = new Set(prev);
      if (wasHearted) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
    setHeartCountsByArticleId((prev) => ({
      ...prev,
      [articleId]: Math.max(0, (prev[articleId] || 0) + (wasHearted ? -1 : 1)),
    }));

    const result = await writeListItem(articleId, LIST_TYPES.favorite, !wasHearted);
    if (result.error) {
      setHeartedIds((prev) => {
        const reverted = new Set(prev);
        if (wasHearted) {
          reverted.add(articleId);
        } else {
          reverted.delete(articleId);
        }
        return reverted;
      });
      setHeartCountsByArticleId((prev) => ({
        ...prev,
        [articleId]: Math.max(0, (prev[articleId] || 0) + (wasHearted ? 1 : -1)),
      }));
      setAuthMessage(result.error);
    }
  }, [heartedIds, writeListItem]);

  const toggleSave = useCallback(async (articleId) => {
    const wasSaved = savedIds.has(articleId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });

    const result = await writeListItem(articleId, LIST_TYPES.readLater, !wasSaved);
    if (result.error) {
      setSavedIds((prev) => {
        const reverted = new Set(prev);
        if (wasSaved) {
          reverted.add(articleId);
        } else {
          reverted.delete(articleId);
        }
        return reverted;
      });
      setAuthMessage(result.error);
    }
  }, [savedIds, writeListItem]);

  const copyArticleLink = async (slug) => {
    const basePath = import.meta.env.BASE_URL || "/";
    const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
    const url = new URL(`article/${slug}`, `${window.location.origin}${normalizedBase}`).toString();
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
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const value = useMemo(
    () => ({
      heartedIds,
      heartCountsByArticleId,
      savedIds,
      lastCopiedSlug,
      showCopyToast,
      theme,
      session,
      user,
      isAdmin,
      articleIndex,
      authLoading,
      listsLoading,
      isLoggedIn,
      authMessage,
      trendingArticles,
      trendingLoading,
      clearAuthMessage,
      signUpWithEmailPassword,
      signInWithEmailPassword,
      sendPasswordResetEmail,
      updatePassword,
      signOut,
      toggleHeart,
      toggleSave,
      copyArticleLink,
      toggleTheme,
      refreshArticleCatalog,
    }),
    [
      heartedIds,
      heartCountsByArticleId,
      savedIds,
      lastCopiedSlug,
      showCopyToast,
      theme,
      session,
      user,
      isAdmin,
      articleIndex,
      authLoading,
      listsLoading,
      isLoggedIn,
      authMessage,
      trendingArticles,
      trendingLoading,
      clearAuthMessage,
      signUpWithEmailPassword,
      signInWithEmailPassword,
      sendPasswordResetEmail,
      updatePassword,
      signOut,
      toggleHeart,
      toggleSave,
      refreshArticleCatalog,
    ]
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
