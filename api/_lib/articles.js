import { parseFrontmatter, toArticleFromIndexRow } from "../../src/lib/articleFormat.js";
import { createSupabaseAdminClient } from "./supabase.js";

const ARTICLE_COLUMNS =
  "slug, title, excerpt, category, author, published_at, read_minutes, trending, draft, is_private, hero_image, storage_path";

async function readArticleIndexRows() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("article_index")
      .select(ARTICLE_COLUMNS)
      .order("published_at", { ascending: false });
    if (error) {
      return [];
    }
    return (data || []).filter((row) => row?.slug);
  } catch {
    return [];
  }
}

async function readBodyFromStoragePath(storagePath) {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.storage.from("articles").download(storagePath);
    if (error) {
      return "";
    }
    const rawMarkdown = await data.text();
    return parseFrontmatter(rawMarkdown).body || "";
  } catch {
    return "";
  }
}

export async function readAllArticles() {
  const indexRows = await readArticleIndexRows();
  const articles = await Promise.all(
    indexRows.map(async (row) => {
      const storagePath = row.storage_path || `articles/${row.slug}.md`;
      const body = await readBodyFromStoragePath(storagePath);
      return toArticleFromIndexRow({ ...row, storage_path: storagePath }, body);
    })
  );
  return articles.filter(Boolean);
}

export async function readArticleBySlug(
  slug,
  { includeDrafts = false, includePrivate = false } = {}
) {
  if (!slug) {
    return null;
  }
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("article_index")
      .select(ARTICLE_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    const storagePath = data.storage_path || `articles/${data.slug}.md`;
    const body = await readBodyFromStoragePath(storagePath);
    const article = toArticleFromIndexRow({ ...data, storage_path: storagePath }, body);
    if (!article) {
      return null;
    }
    if (!includeDrafts && article.draft) {
      return null;
    }
    if (!includePrivate && article.isPrivate) {
      return null;
    }
    return article;
  } catch {
    return null;
  }
}
