function parseValue(rawValue) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return value;
}

function quoteString(value) {
  const escaped = String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function parseFrontmatter(rawMarkdown = "") {
  if (!rawMarkdown.startsWith("---\n")) {
    return { attributes: {}, body: rawMarkdown.trim() };
  }

  const endMarkerIndex = rawMarkdown.indexOf("\n---", 4);
  if (endMarkerIndex < 0) {
    return { attributes: {}, body: rawMarkdown.trim() };
  }

  const frontmatterBlock = rawMarkdown.slice(4, endMarkerIndex).trim();
  const markdownBody = rawMarkdown.slice(endMarkerIndex + 4).trim();
  const attributes = {};

  for (const line of frontmatterBlock.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    if (!key) {
      continue;
    }

    attributes[key] = parseValue(value);
  }

  return { attributes, body: markdownBody };
}

export function toMarkdownDocument(article = {}) {
  const frontmatter = [
    `slug: ${quoteString(article.slug || "")}`,
    `title: ${quoteString(article.title || "")}`,
    `excerpt: ${quoteString(article.excerpt || "")}`,
    `category: ${quoteString(article.category || "automation")}`,
    `author: ${quoteString(article.author || "William")}`,
    `publishedAt: ${quoteString(article.publishedAt || new Date().toISOString())}`,
    `readMinutes: ${Number(article.readMinutes || 5)}`,
    `trending: ${Boolean(article.trending)}`,
    `draft: ${Boolean(article.draft)}`,
    `isPrivate: ${Boolean(article.isPrivate)}`,
    `heroImage: ${quoteString(article.heroImage || "")}`,
  ];

  const body = String(article.body || "").trim();
  return `---\n${frontmatter.join("\n")}\n---\n\n${body}\n`;
}

export function toArticleFromMarkdown(rawMarkdown, sourcePath = "") {
  const { attributes, body } = parseFrontmatter(rawMarkdown);
  const fallbackSlug = sourcePath.split("/").pop()?.replace(/\.md$/i, "") ?? "";
  const slug = String(attributes.slug || fallbackSlug).trim();

  if (!slug) {
    return null;
  }

  return {
    id: String(attributes.id || slug),
    slug,
    title: String(attributes.title || slug),
    excerpt: String(attributes.excerpt || ""),
    category: String(attributes.category || "automation"),
    author: String(attributes.author || "William"),
    publishedAt: String(attributes.publishedAt || new Date().toISOString()),
    readMinutes: Number(attributes.readMinutes || 5),
    trending: Boolean(attributes.trending),
    draft: Boolean(attributes.draft),
    heroImage: attributes.heroImage ? String(attributes.heroImage) : "",
    body,
  };
}

export function toArticleFromIndexRow(row, body = "") {
  if (!row?.slug) {
    return null;
  }

  return {
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
    body: String(body || ""),
    source: "bucket",
    storagePath: row.storage_path || `articles/${row.slug}.md`,
  };
}
