import { marked } from "marked";
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function buildNewsletterHtml(article) {
  const articleUrl = toAbsoluteUrl(`/article/${article.slug}`);
  const markdownWithAbsoluteLinks = absolutizeMarkdownLinks(article.body || "");
  const htmlBody = marked.parse(markdownWithAbsoluteLinks, {
    gfm: true,
    breaks: true,
  });
  const title = escapeHtml(article.title);
  const author = escapeHtml(article.author);
  const publishedAt = escapeHtml(formatDate(article.publishedAt));
  const excerpt = escapeHtml(article.excerpt || "");
  const safeArticleUrl = escapeHtml(articleUrl);

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:#f5f5f5;color:#111111;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border:1px solid #e5e5e5;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;color:#2e8b57;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">William's Testbed</p>
                <h1 style="margin:0 0 10px;font-size:34px;line-height:1.2;">${title}</h1>
                <p style="margin:0 0 14px;color:#666666;font-size:13px;">${author} · ${publishedAt}</p>
                ${excerpt ? `<p style="margin:0 0 20px;color:#333333;font-size:17px;line-height:1.6;">${excerpt}</p>` : ""}
                <div style="font-size:17px;line-height:1.75;color:#111111;">${htmlBody}</div>
                <div style="margin-top:28px;padding-top:16px;border-top:1px solid #ececec;">
                  <a href="${safeArticleUrl}" style="color:#2e8b57;font-size:16px;text-decoration:underline;">Read on the website</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    html,
    articleUrl,
    subject: article.title,
  };
}
