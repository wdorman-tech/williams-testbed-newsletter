# Newsletter Publishing Workflow

## 1) Write articles in Markdown

- Put each article in `src/content/articles/*.md`.
- Use frontmatter keys from `src/content/articles/article-template.md`.
- Keep `draft: true` while editing.

## 2) Preview before going live

- Article preview: `/preview/article/:slug`
- Email preview: `/preview/email/:slug`
- In Settings, use **Send Test Email** to check rendering in a real inbox.

## 3) Publish + send

1. Set `draft: false` in the article file.
2. Push/deploy.
3. In Settings, select article and click **Send To All Subscribers**.
4. Type the exact slug to confirm send-all.

## 4) Images (Supabase Storage)

- Upload newsletter images to your public Supabase Storage bucket.
- Use full public URLs in markdown:
  - `![alt](https://<project>.supabase.co/storage/v1/object/public/articles/your-image.png)`

## 5) Required environment variables

Client/runtime:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NEWSLETTER_ADMIN_EMAILS` (comma-separated emails allowed to send)

Server/runtime:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEWSLETTER_FROM_EMAIL`
- `NEW_SUBSCRIBER_WEBHOOK_SECRET` (shared secret expected by `/api/newsletter-new-subscriber-alert`)
- `NEW_SUBSCRIBER_ALERT_TO` (optional, defaults to `wdorman26@gmail.com`)
- `NEWSLETTER_ADMIN_EMAILS` (same comma-separated admin list on server)
- `NEWSLETTER_SITE_URL` (e.g. `https://yourdomain.com`)

## 6) Supabase SQL setup

- Run `supabase/schema.sql` in your Supabase SQL editor.
- This creates:
  - `user_article_lists`
  - `newsletter_subscribers`
  - `newsletter_sends`
  - auth-user email sync trigger into `newsletter_subscribers`

## 7) New-subscriber alert setup

After applying `supabase/schema.sql`, set these DB settings in Supabase SQL Editor so insert triggers can call your API endpoint:

```sql
alter database postgres set app.settings.newsletter_alert_webhook_url = 'https://<your-domain>/api/newsletter-new-subscriber-alert';
alter database postgres set app.settings.newsletter_alert_webhook_secret = '<same value as NEW_SUBSCRIBER_WEBHOOK_SECRET>';
```

This sends an alert email (subscriber email + signup timestamp) whenever a new row is inserted into `newsletter_subscribers`.
