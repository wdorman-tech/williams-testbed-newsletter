create extension if not exists pgcrypto;

-- Base user mirror table
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profile table with role and settings fields
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  display_name text,
  stripe_customer_id text,
  weekly_digest_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Newsletter archive + admin authored content
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sent_at timestamptz,
  resend_message_id text,
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Weekly AI tool recommendations page data
create table if not exists public.tool_recommendations (
  id uuid primary key default gen_random_uuid(),
  week_of date unique not null,
  title text not null,
  content text not null,
  is_published boolean not null default true,
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists newsletters_set_updated_at on public.newsletters;
create trigger newsletters_set_updated_at
before update on public.newsletters
for each row
execute function public.set_updated_at();

drop trigger if exists tool_recommendations_set_updated_at on public.tool_recommendations;
create trigger tool_recommendations_set_updated_at
before update on public.tool_recommendations
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.newsletters enable row level security;
alter table public.tool_recommendations enable row level security;

drop policy if exists "users_can_select_own_row" on public.users;
create policy "users_can_select_own_row"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_can_select_own" on public.profiles;
create policy "profiles_can_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_can_update_own" on public.profiles;
create policy "profiles_can_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "members_can_read_published_newsletters" on public.newsletters;
create policy "members_can_read_published_newsletters"
  on public.newsletters
  for select
  using (status = 'published');

drop policy if exists "members_can_read_published_tools" on public.tool_recommendations;
create policy "members_can_read_published_tools"
  on public.tool_recommendations
  for select
  using (is_published = true);
