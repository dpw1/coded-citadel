-- =============================================================================
-- Supabase RLS — Coded Citadel landing page + local admin panel
--
-- Run in Supabase → SQL Editor.
--
-- BEFORE running:
--   1. Create an Auth user for yourself (Authentication → Users).
--   2. Add your email to public.is_admin() below if needed.
--
-- Public clients (anon key ships in the website + extensions):
--   INSERT feedback, yt_filter_pro_data, event_tracker
--   RPC get_event_counts (keep existing SECURITY DEFINER definition)
--
-- Local admin panel (admin/index.html — NOT deployed to codedcitadel.com):
--   Sign in with Supabase Auth; authenticated JWT + is_admin() for reads/writes.
--
-- NEVER re-add anon SELECT on feedback or yt_filter_pro_data.
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'codedcitadel@gmail.com'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- feedback (uninstall form + extension bug reports)
-- ---------------------------------------------------------------------------
alter table public.feedback enable row level security;

drop policy if exists "anon_select_feedback" on public.feedback;
drop policy if exists "anon_insert_feedback" on public.feedback;
drop policy if exists "admin_select_feedback" on public.feedback;

create policy "anon_insert_feedback"
  on public.feedback
  for insert
  to anon
  with check (true);

create policy "admin_select_feedback"
  on public.feedback
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- yt_filter_pro_data (extension telemetry)
-- ---------------------------------------------------------------------------
alter table public.yt_filter_pro_data enable row level security;

drop policy if exists "anon_select_yt_filter_pro_data" on public.yt_filter_pro_data;
drop policy if exists "anon_insert_yt_filter_pro_data" on public.yt_filter_pro_data;
drop policy if exists "admin_select_yt_filter_pro_data" on public.yt_filter_pro_data;

create policy "anon_insert_yt_filter_pro_data"
  on public.yt_filter_pro_data
  for insert
  to anon
  with check (true);

create policy "admin_select_yt_filter_pro_data"
  on public.yt_filter_pro_data
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- event_tracker (plugin download / modal analytics on codedcitadel.com)
-- ---------------------------------------------------------------------------
alter table public.event_tracker enable row level security;

drop policy if exists "anon_select_event_tracker" on public.event_tracker;
drop policy if exists "anon_insert_event_tracker" on public.event_tracker;

create policy "anon_insert_event_tracker"
  on public.event_tracker
  for insert
  to anon
  with check (true);

-- Public download counts use RPC get_event_counts (should be SECURITY DEFINER).
-- Do not grant anon SELECT on rows — that would expose visitor_id / user_agent.

-- ---------------------------------------------------------------------------
-- YT Filter Pro admin tables (logged-in users, gift codes)
-- Admin panel reads/writes; extensions may have separate policies — do not drop
-- unknown policy names here.
-- ---------------------------------------------------------------------------
alter table if exists public.yt_filter_pro_profiles enable row level security;
alter table if exists public.yt_filter_pro_gift_codes enable row level security;
alter table if exists public.yt_filter_pro_gift_redemptions enable row level security;

drop policy if exists "anon_select_yt_filter_pro_profiles" on public.yt_filter_pro_profiles;
drop policy if exists "admin_all_yt_filter_pro_profiles" on public.yt_filter_pro_profiles;
create policy "admin_all_yt_filter_pro_profiles"
  on public.yt_filter_pro_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "anon_select_yt_filter_pro_gift_codes" on public.yt_filter_pro_gift_codes;
drop policy if exists "admin_all_yt_filter_pro_gift_codes" on public.yt_filter_pro_gift_codes;
create policy "admin_all_yt_filter_pro_gift_codes"
  on public.yt_filter_pro_gift_codes
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "anon_select_yt_filter_pro_gift_redemptions" on public.yt_filter_pro_gift_redemptions;
drop policy if exists "admin_select_yt_filter_pro_gift_redemptions" on public.yt_filter_pro_gift_redemptions;
create policy "admin_select_yt_filter_pro_gift_redemptions"
  on public.yt_filter_pro_gift_redemptions
  for select
  to authenticated
  using (public.is_admin());

-- If you use rpc/yt_filter_pro_admin_list_profiles, ensure it checks is_admin()
-- or revoke EXECUTE from anon and grant EXECUTE to authenticated only.
