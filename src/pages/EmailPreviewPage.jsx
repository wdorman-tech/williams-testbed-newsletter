import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useArticles } from "../hooks/useArticles";

function buildPreviewSrcDoc(article) {
  const title = article?.title || "Email Preview";
  const excerpt = article?.excerpt || "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; background: #f5f5f5; color: #111111; font-family: Georgia, serif; }
      .wrap { max-width: 680px; margin: 0 auto; background: #ffffff; padding: 24px; border: 1px solid #e5e5e5; }
      h1 { margin: 0 0 10px; font-size: 32px; line-height: 1.2; }
      .muted { color: #666666; font-size: 14px; margin: 0 0 24px; }
      .body { font-size: 18px; line-height: 1.7; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>${title}</h1>
      <p class="muted">${excerpt}</p>
      <div class="body">
        This page previews the email via the server route. Use the server-generated preview below.
      </div>
    </div>
  </body>
</html>`;
}

export default function EmailPreviewPage() {
  const { slug } = useParams();
  const { getArticleBySlug } = useArticles();
  const article = getArticleBySlug(slug, { includeDrafts: true });

  const previewUrl = useMemo(() => {
    if (!slug) {
      return "";
    }
    return `/api/newsletter-preview?slug=${encodeURIComponent(slug)}`;
  }, [slug]);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (!article) {
    return (
      <section className="page-stack">
        <h1>Email Preview Not Found</h1>
        <p className="empty-state">
          That article does not exist. <Link to="/">Return home</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-intro">
        <p className="eyebrow">Email Preview</p>
        <h1>{article.title}</h1>
        <p>Preview this newsletter as rendered by the server template before sending.</p>
      </div>

      <iframe
        title={`Email preview for ${article.title}`}
        className="email-preview-frame"
        src={previewUrl}
        srcDoc={buildPreviewSrcDoc(article)}
      />
    </section>
  );
}
