create table if not exists public.user_article_lists (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  list_type text not null check (list_type in ('favorite', 'read_later')),
  inserted_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (user_id, article_id, list_type)
);

alter table public.user_article_lists enable row level security;

create policy if not exists "Users can read their own article lists"
  on public.user_article_lists
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own article lists"
  on public.user_article_lists
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own article lists"
  on public.user_article_lists
  for delete
  using (auth.uid() = user_id);
