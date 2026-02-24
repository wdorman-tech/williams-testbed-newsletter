create table if not exists public.user_article_lists (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  list_type text not null check (list_type in ('favorite', 'read_later')),
  inserted_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (user_id, article_id, list_type)
);

alter table public.user_article_lists enable row level security;

create policy "Users can read their own article lists"
  on public.user_article_lists
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own article lists"
  on public.user_article_lists
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own article lists"
  on public.user_article_lists
  for delete
  using (auth.uid() = user_id);

create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  inserted_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.newsletter_subscribers enable row level security;

create table if not exists public.newsletter_sends (
  id bigint generated always as identity primary key,
  article_slug text not null unique,
  sent_by_user_id uuid references auth.users(id) on delete set null,
  sent_count integer not null default 0,
  inserted_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.newsletter_sends enable row level security;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trigger_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger trigger_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.update_updated_at_column();

create or replace function public.sync_auth_user_to_newsletter_subscribers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.newsletter_subscribers (user_id, email, status)
  values (new.id, lower(new.email), 'active')
  on conflict (email)
  do update set
    user_id = excluded.user_id,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists trigger_auth_user_newsletter_sync on auth.users;
create trigger trigger_auth_user_newsletter_sync
after insert on auth.users
for each row
execute function public.sync_auth_user_to_newsletter_subscribers();

insert into public.newsletter_subscribers (user_id, email, status)
select id, lower(email), 'active'
from auth.users
where email is not null
on conflict (email) do update
set user_id = excluded.user_id;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inserted_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.admin_users enable row level security;

create table if not exists public.article_views (
  id bigint generated always as identity primary key,
  article_slug text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_key text,
  viewed_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.article_views enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

drop policy if exists "Users can read their own admin row" on public.admin_users;
create policy "Users can read their own admin row"
  on public.admin_users
  for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all user article lists" on public.user_article_lists;
create policy "Admins can read all user article lists"
  on public.user_article_lists
  for select
  using (public.is_admin());

drop policy if exists "Anyone can insert article views" on public.article_views;
create policy "Anyone can insert article views"
  on public.article_views
  for insert
  with check (true);

drop policy if exists "Admins can read article views" on public.article_views;
create policy "Admins can read article views"
  on public.article_views
  for select
  using (public.is_admin());

drop policy if exists "Admins can read newsletter sends" on public.newsletter_sends;
create policy "Admins can read newsletter sends"
  on public.newsletter_sends
  for select
  using (public.is_admin());

create index if not exists idx_article_views_article_slug on public.article_views(article_slug);
create index if not exists idx_article_views_user_id on public.article_views(user_id);
create index if not exists idx_article_views_viewed_at on public.article_views(viewed_at desc);

create table if not exists public.article_settings (
  article_slug text primary key,
  is_private boolean not null default false,
  category text check (category in ('automation', 'marketing', 'my-workflow', 'my-tools')),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.article_settings enable row level security;

create table if not exists public.admin_articles (
  slug text primary key,
  title text not null,
  excerpt text not null default '',
  category text not null check (category in ('automation', 'marketing', 'my-workflow', 'my-tools')),
  author text not null default 'William',
  published_at timestamp with time zone not null default timezone('utc'::text, now()),
  read_minutes integer not null default 5 check (read_minutes > 0),
  trending boolean not null default false,
  draft boolean not null default false,
  is_private boolean not null default false,
  hero_image text not null default '',
  body text not null default '',
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.admin_articles enable row level security;

drop trigger if exists trigger_article_settings_updated_at on public.article_settings;
create trigger trigger_article_settings_updated_at
before update on public.article_settings
for each row
execute function public.update_updated_at_column();

drop trigger if exists trigger_admin_articles_updated_at on public.admin_articles;
create trigger trigger_admin_articles_updated_at
before update on public.admin_articles
for each row
execute function public.update_updated_at_column();

drop policy if exists "Authenticated users can read article settings" on public.article_settings;
create policy "Authenticated users can read article settings"
  on public.article_settings
  for select
  using (auth.uid() is not null);

drop policy if exists "Admins can write article settings" on public.article_settings;
create policy "Admins can write article settings"
  on public.article_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can read admin articles" on public.admin_articles;
create policy "Authenticated users can read admin articles"
  on public.admin_articles
  for select
  using (auth.uid() is not null);

drop policy if exists "Admins can write admin articles" on public.admin_articles;
create policy "Admins can write admin articles"
  on public.admin_articles
  for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.article_index (
  slug text primary key,
  title text not null,
  excerpt text not null default '',
  category text not null check (category in ('automation', 'marketing', 'my-workflow', 'my-tools')),
  author text not null default 'William',
  published_at timestamp with time zone not null default timezone('utc'::text, now()),
  read_minutes integer not null default 5 check (read_minutes > 0),
  trending boolean not null default false,
  draft boolean not null default false,
  is_private boolean not null default false,
  hero_image text not null default '',
  storage_path text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);
alter table public.article_index enable row level security;

drop trigger if exists trigger_article_index_updated_at on public.article_index;
create trigger trigger_article_index_updated_at
before update on public.article_index
for each row
execute function public.update_updated_at_column();

drop policy if exists "Authenticated users can read article index" on public.article_index;
create policy "Authenticated users can read article index"
  on public.article_index
  for select
  using (auth.uid() is not null);

drop policy if exists "Admins can write article index" on public.article_index;
create policy "Admins can write article index"
  on public.article_index
  for all
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('articles', 'articles', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read article markdown" on storage.objects;
create policy "Authenticated users can read article markdown"
  on storage.objects
  for select
  using (bucket_id = 'articles' and auth.uid() is not null);

drop policy if exists "Admins can insert article markdown" on storage.objects;
create policy "Admins can insert article markdown"
  on storage.objects
  for insert
  with check (bucket_id = 'articles' and public.is_admin());

drop policy if exists "Admins can update article markdown" on storage.objects;
create policy "Admins can update article markdown"
  on storage.objects
  for update
  using (bucket_id = 'articles' and public.is_admin())
  with check (bucket_id = 'articles' and public.is_admin());

drop policy if exists "Admins can delete article markdown" on storage.objects;
create policy "Admins can delete article markdown"
  on storage.objects
  for delete
  using (bucket_id = 'articles' and public.is_admin());
