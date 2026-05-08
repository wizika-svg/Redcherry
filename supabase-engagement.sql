
begin;

-- =========================================================
-- EXTENSIONS
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
new.updated_at = now();
return new;
end;
$$;

-- =========================================================
-- PROFILES TABLE
-- =========================================================

create table if not exists public.profiles (
id uuid primary key references auth.users(id) on delete cascade,
username text unique,
full_name text,
avatar_url text,
role text not null default 'user',
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

constraint profiles_role_check
check (role in ('user', 'admin'))
);

create index if not exists idx_profiles_role
on public.profiles(role);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop trigger if exists trg_profiles_updated_at on public.profiles;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================================================
-- HELPER FUNCTION
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
select exists (
select 1
from public.profiles
where id = auth.uid()
and role = 'admin'
);
$$;

-- =========================================================
-- VIDEOS TABLE
-- =========================================================

create table if not exists public.videos (
id text primary key,
title text not null,
description text,
thumbnail_url text,
video_url text not null,
category text,
tags text[] default '{}',
view_count bigint not null default 0,
duration text default '00:00',
featured boolean not null default false,
trending boolean not null default false,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create index if not exists idx_videos_created_at
on public.videos(created_at desc);

create index if not exists idx_videos_category
on public.videos(category);

create index if not exists idx_videos_featured
on public.videos(featured);

create index if not exists idx_videos_trending
on public.videos(trending);

alter table public.videos enable row level security;

drop policy if exists "videos_select_all" on public.videos;
create policy "videos_select_all"
on public.videos
for select
using (true);

drop policy if exists "videos_insert_admin" on public.videos;
create policy "videos_insert_admin"
on public.videos
for insert
with check (public.is_admin());

drop policy if exists "videos_update_admin" on public.videos;
create policy "videos_update_admin"
on public.videos
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "videos_delete_admin" on public.videos;
create policy "videos_delete_admin"
on public.videos
for delete
using (public.is_admin());

drop trigger if exists trg_videos_updated_at on public.videos;

create trigger trg_videos_updated_at
before update on public.videos
for each row
execute function public.set_updated_at();

-- =========================================================
-- USER VIDEO ACTIONS
-- =========================================================

create table if not exists public.user_video_actions (
user_id uuid not null references auth.users(id) on delete cascade,
video_id text not null references public.videos(id) on delete cascade,

liked boolean not null default false,
saved boolean not null default false,
favorited boolean not null default false,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

primary key (user_id, video_id)
);

create index if not exists idx_user_video_actions_video_id
on public.user_video_actions(video_id);

alter table public.user_video_actions enable row level security;

drop policy if exists "user_actions_select_own" on public.user_video_actions;
create policy "user_actions_select_own"
on public.user_video_actions
for select
using (user_id = auth.uid());

drop policy if exists "user_actions_insert_own" on public.user_video_actions;
create policy "user_actions_insert_own"
on public.user_video_actions
for insert
with check (user_id = auth.uid());

drop policy if exists "user_actions_update_own" on public.user_video_actions;
create policy "user_actions_update_own"
on public.user_video_actions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_actions_delete_own" on public.user_video_actions;
create policy "user_actions_delete_own"
on public.user_video_actions
for delete
using (user_id = auth.uid());

drop trigger if exists trg_user_video_actions_updated_at on public.user_video_actions;

create trigger trg_user_video_actions_updated_at
before update on public.user_video_actions
for each row
execute function public.set_updated_at();

-- =========================================================
-- VIDEO VIEWS
-- =========================================================

create table if not exists public.video_views (
id bigserial primary key,

video_id text not null
references public.videos(id)
on delete cascade,

viewer_key text not null,
view_slot bigint not null,

viewed_at timestamptz not null default now(),

unique(video_id, viewer_key, view_slot)
);

create index if not exists idx_video_views_video_id
on public.video_views(video_id);

create index if not exists idx_video_views_viewed_at_desc
on public.video_views(viewed_at desc);

alter table public.video_views enable row level security;

drop policy if exists "video_views_insert_any" on public.video_views;

create policy "video_views_insert_any"
on public.video_views
for insert
with check (true);

-- =========================================================
-- RECORD VIDEO VIEW FUNCTION
-- =========================================================

create or replace function public.record_video_view(
p_video_id text,
p_viewer_key text,
p_view_slot bigint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
inserted_id bigint;
begin

insert into public.video_views (
video_id,
viewer_key,
view_slot
)
values (
p_video_id,
p_viewer_key,
p_view_slot
)
on conflict (
video_id,
viewer_key,
view_slot
)
do nothing
returning id into inserted_id;

if inserted_id is null then
return false;
end if;

update public.videos
set view_count = view_count + 1
where id = p_video_id;

return true;

exception
when others then
return false;
end;
$$;

grant execute on function public.record_video_view(text, text, bigint)
to anon, authenticated;

-- =========================================================
-- PREMIUM UPGRADE REQUESTS
-- =========================================================

create table if not exists public.premium_upgrade_requests (
id uuid primary key default gen_random_uuid(),

user_id uuid not null
unique
references auth.users(id)
on delete cascade,

email text not null,
payment_receipt_url text,

premium_plan text not null default 'standard',

status text not null default 'pending',

created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

constraint premium_request_status_check
check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_premium_upgrade_requests_user_id
on public.premium_upgrade_requests(user_id);

create index if not exists idx_premium_upgrade_requests_status
on public.premium_upgrade_requests(status);

alter table public.premium_upgrade_requests enable row level security;

drop policy if exists "premium_requests_select_own"
on public.premium_upgrade_requests;

create policy "premium_requests_select_own"
on public.premium_upgrade_requests
for select
using (user_id = auth.uid());

drop policy if exists "premium_requests_select_admin"
on public.premium_upgrade_requests;

create policy "premium_requests_select_admin"
on public.premium_upgrade_requests
for select
using (public.is_admin());

drop policy if exists "premium_requests_insert_own"
on public.premium_upgrade_requests;

create policy "premium_requests_insert_own"
on public.premium_upgrade_requests
for insert
with check (user_id = auth.uid());

drop policy if exists "premium_requests_update_admin"
on public.premium_upgrade_requests;

create policy "premium_requests_update_admin"
on public.premium_upgrade_requests
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "premium_requests_delete_admin"
on public.premium_upgrade_requests;

create policy "premium_requests_delete_admin"
on public.premium_upgrade_requests
for delete
using (public.is_admin());

drop trigger if exists trg_premium_requests_updated_at
on public.premium_upgrade_requests;

create trigger trg_premium_requests_updated_at
before update on public.premium_upgrade_requests
for each row
execute function public.set_updated_at();

-- =========================================================
-- PREMIUM SUBSCRIPTIONS
-- =========================================================

create table if not exists public.premium_subscriptions (
id uuid primary key default gen_random_uuid(),

user_id uuid not null
unique
references auth.users(id)
on delete cascade,

email text not null,

premium_plan text not null default 'standard',

subscribed_at timestamptz not null default now(),
expires_at timestamptz,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create index if not exists idx_premium_subscriptions_user_id
on public.premium_subscriptions(user_id);

create index if not exists idx_premium_subscriptions_expires_at
on public.premium_subscriptions(expires_at);

alter table public.premium_subscriptions enable row level security;

drop policy if exists "premium_subs_select_own"
on public.premium_subscriptions;

create policy "premium_subs_select_own"
on public.premium_subscriptions
for select
using (user_id = auth.uid());

drop policy if exists "premium_subs_select_admin"
on public.premium_subscriptions;

create policy "premium_subs_select_admin"
on public.premium_subscriptions
for select
using (public.is_admin());

drop trigger if exists trg_premium_subscriptions_updated_at
on public.premium_subscriptions;

create trigger trg_premium_subscriptions_updated_at
before update on public.premium_subscriptions
for each row
execute function public.set_updated_at();

commit;