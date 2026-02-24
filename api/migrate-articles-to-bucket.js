import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  toArticleFromMarkdown,
  toMarkdownDocument,
} from "../src/lib/articleFormat.js";
import { createSupabaseAdminClient } from "./_lib/supabase.js";

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

async function readLegacyAdminArticles(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from("admin_articles")
    .select(
      "slug, title, excerpt, category, author, published_at, read_minutes, trending, draft, is_private, hero_image, body"
    );
  if (error) {
    throw new Error(`Could not read admin_articles: ${error.message}`);
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
}

async function readArticleSettings(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from("article_settings")
    .select("article_slug, is_private, category");
  if (error) {
    throw new Error(`Could not read article_settings: ${error.message}`);
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
}

function normalizeArticles(markdownArticles, adminArticles, articleSettings) {
  const normalizedMarkdown = markdownArticles.map((article) => {
    const override = articleSettings[article.slug];
    return {
      ...article,
      category: override?.category || article.category,
      isPrivate: Boolean(override?.isPrivate),
    };
  });

  // Preserve existing precedence: markdown wins on slug conflicts.
  const bySlug = new Map(adminArticles.map((article) => [article.slug, article]));
  for (const article of normalizedMarkdown) {
    bySlug.set(article.slug, article);
  }
  return [...bySlug.values()];
}

function toArticleIndexPayload(article) {
  const slug = String(article.slug || "").trim();
  const storagePath = `articles/${slug}.md`;

  return {
    slug,
    storage_path: storagePath,
    row: {
      slug,
      title: article.title || slug,
      excerpt: article.excerpt || "",
      category: article.category || "automation",
      author: article.author || "William",
      published_at: article.publishedAt || new Date().toISOString(),
      read_minutes: Number(article.readMinutes || 5),
      trending: Boolean(article.trending),
      draft: Boolean(article.draft),
      is_private: Boolean(article.isPrivate),
      hero_image: article.heroImage || "",
      storage_path: storagePath,
    },
  };
}

export async function migrateArticlesToBucket() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
  if (bucketsError) {
    throw new Error(`Could not list storage buckets: ${bucketsError.message}`);
  }
  const hasArticlesBucket = (buckets || []).some((bucket) => bucket?.id === "articles");
  if (!hasArticlesBucket) {
    const { error: createBucketError } = await supabaseAdmin.storage.createBucket("articles", {
      public: false,
    });
    if (createBucketError) {
      throw new Error(`Could not create articles bucket: ${createBucketError.message}`);
    }
  }

  const [markdownArticles, adminArticles, articleSettings] = await Promise.all([
    readMarkdownArticles(),
    readLegacyAdminArticles(supabaseAdmin),
    readArticleSettings(supabaseAdmin),
  ]);
  const articles = normalizeArticles(markdownArticles, adminArticles, articleSettings);

  let migratedCount = 0;
  const failures = [];

  for (const article of articles) {
    const { slug, storage_path: storagePath, row } = toArticleIndexPayload(article);
    if (!slug) {
      continue;
    }
    try {
      const markdownDocument = toMarkdownDocument(article);
      const markdownBuffer = Buffer.from(markdownDocument, "utf-8");
      const { error: uploadError } = await supabaseAdmin.storage
        .from("articles")
        .upload(storagePath, markdownBuffer, {
          upsert: true,
          contentType: "text/markdown",
        });
      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: upsertError } = await supabaseAdmin
        .from("article_index")
        .upsert(row, { onConflict: "slug" });
      if (upsertError) {
        throw new Error(upsertError.message);
      }

      migratedCount += 1;
    } catch (error) {
      failures.push({
        slug,
        error: error instanceof Error ? error.message : "Unknown migration error",
      });
    }
  }

  return {
    totalCandidates: articles.length,
    migratedCount,
    failedCount: failures.length,
    failures,
  };
}

async function runFromCli() {
  const result = await migrateArticlesToBucket();
  if (result.failedCount > 0) {
    console.error(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify(result, null, 2));
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (entryUrl && import.meta.url === entryUrl) {
  void runFromCli();
}
