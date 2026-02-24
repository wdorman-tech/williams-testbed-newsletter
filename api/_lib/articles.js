import fs from "node:fs/promises";
import path from "node:path";
import { toArticleFromMarkdown } from "../../src/lib/articleFormat.js";
import { createSupabaseAdminClient } from "./supabase.js";

function getArticlesDirectory() {
  return path.join(process.cwd(), "src", "content", "articles");
}

async function readMarkdownArticles() {
  const directoryPath = getArticlesDirectory();
  let files = [];

  try {
    files = await fs.readdir(directoryPath);
  } catch {
    return [];
  }

  const markdownFiles = files.filter((fileName) => fileName.endsWith(".md"));
  const articles = [];

  for (const fileName of markdownFiles) {
    const fullPath = path.join(directoryPath, fileName);
    const raw = await fs.readFile(fullPath, "utf-8");
    const article = toArticleFromMarkdown(raw, fullPath.replaceAll("\\", "/"));
    if (article) {
      articles.push(article);
    }
  }

  return articles;
}

async function readAdminArticles() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("admin_articles")
      .select(
        "slug, title, excerpt, category, author, published_at, read_minutes, trending, draft, is_private, hero_image, body"
      );
    if (error) {
      return [];
    }
    return (data || [])
      .filter((row) => row?.slug)
      .map((row) => ({
        id: row.slug,
        slug: row.slug,
        title: row.title || row.slug,
        excerpt: row.excerpt || "",
        category: row.category || "automation",
        author: row.author || "William",
        publishedAt: row.published_at || new Date().toISOString(),
        readMinutes: Number(row.read_minutes || 5),
        trending: Boolean(row.trending),
        draft: Boolean(row.draft),
        isPrivate: Boolean(row.is_private),
        heroImage: row.hero_image || "",
        body: row.body || "",
      }));
  } catch {
    return [];
  }
}

async function readArticleSettings() {
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("article_settings")
      .select("article_slug, is_private, category");
    if (error) {
      return {};
    }
    const mapped = {};
    for (const row of data || []) {
      if (!row?.article_slug) {
        continue;
      }
      mapped[row.article_slug] = {
        isPrivate: Boolean(row.is_private),
        category: row.category || null,
      };
    }
    return mapped;
  } catch {
    return {};
  }
}

export async function readAllArticles() {
  const [markdownArticles, adminArticles, articleSettings] = await Promise.all([
    readMarkdownArticles(),
    readAdminArticles(),
    readArticleSettings(),
  ]);

  const normalizedMarkdown = markdownArticles.map((article) => {
    const override = articleSettings[article.slug];
    return {
      ...article,
      category: override?.category || article.category,
      isPrivate: Boolean(override?.isPrivate),
    };
  });

  const markdownSlugs = new Set(normalizedMarkdown.map((article) => article.slug));
  const normalizedAdmin = adminArticles.filter((article) => !markdownSlugs.has(article.slug));

  return [...normalizedMarkdown, ...normalizedAdmin].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
}

export async function readArticleBySlug(
  slug,
  { includeDrafts = false, includePrivate = false } = {}
) {
  const articles = await readAllArticles();
  const draftScoped = includeDrafts ? articles : articles.filter((article) => !article.draft);
  const scoped = includePrivate ? draftScoped : draftScoped.filter((article) => !article.isPrivate);
  return scoped.find((article) => article.slug === slug) ?? null;
}
