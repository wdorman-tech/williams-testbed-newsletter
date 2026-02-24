import * as React from "react";
import { render } from "@react-email/render";
import { marked } from "marked";
import NewsletterEmail from "../../src/email/NewsletterEmail.jsx";
import { getSiteUrl } from "./env.js";

function toAbsoluteUrl(url) {
  const siteUrl = getSiteUrl();
  if (!url) {
    return siteUrl;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${siteUrl}${url}`;
  }
  return `${siteUrl}/${url}`;
}

function absolutizeMarkdownLinks(markdown) {
  return markdown.replace(/\]\(([^)]+)\)/g, (_full, rawLink) => {
    const link = rawLink.trim();
    if (link.startsWith("http://") || link.startsWith("https://") || link.startsWith("mailto:")) {
      return `](${link})`;
    }
    if (link.startsWith("#")) {
      return `](${link})`;
    }
    return `](${toAbsoluteUrl(link)})`;
  });
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

export async function buildNewsletterHtml(article) {
  const articleUrl = toAbsoluteUrl(`/article/${article.slug}`);
  const markdownWithAbsoluteLinks = absolutizeMarkdownLinks(article.body || "");
  const htmlBody = marked.parse(markdownWithAbsoluteLinks, {
    gfm: true,
    breaks: true,
  });

  const html = await render(
    React.createElement(NewsletterEmail, {
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      publishedAt: formatDate(article.publishedAt),
      articleUrl,
      htmlBody,
    })
  );

  return {
    html,
    articleUrl,
    subject: article.title,
  };
}
