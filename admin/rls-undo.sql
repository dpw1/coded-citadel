-- =============================================================================
-- UNDO admin/rls.sql — revert to anon-key admin reads (local file:// admin panel)
--
-- Run in Supabase → SQL Editor.
--
-- SAFE FOR DATA: This script only drops/recreates RLS *policies* and one helper
-- function. It does NOT delete, truncate, or modify any table rows.
--
-- WARNING: This restores open anon SELECT on feedback and yt_filter_pro_data.
-- Anyone with the public anon key (embedded in your site JS) can read all rows again.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Step 1 — Drop admin policies FIRST (they depend on is_admin())
-- ---------------------------------------------------------------------------
drop policy if exists "admin_select_feedback" on public.feedback;
drop policy if exists "admin_select_yt_filter_pro_data" on public.yt_filter_pro_data;
drop policy if exists "admin_all_yt_filter_pro_profiles" on public.yt_filter_pro_profiles;
drop policy if exists "admin_all_yt_filter_pro_gift_codes" on public.yt_filter_pro_gift_codes;
drop policy if exists "admin_select_yt_filter_pro_gift_redemptions" on public.yt_filter_pro_gift_redemptions;

-- ---------------------------------------------------------------------------
-- Step 2 — Drop helper function (safe once policies above are gone)
-- ---------------------------------------------------------------------------
drop function if exists public.is_admin();

-- ---------------------------------------------------------------------------
-- Step 3 — Restore anon policies
-- ---------------------------------------------------------------------------

-- feedback
alter table public.feedback enable row level security;

drop policy if exists "anon_insert_feedback" on public.feedback;
drop policy if exists "anon_select_feedback" on public.feedback;

create policy "anon_select_feedback"
  on public.feedback
  for select
  to anon
  using (true);

create policy "anon_insert_feedback"
  on public.feedback
  for insert
  to anon
  with check (true);

-- yt_filter_pro_data
alter table public.yt_filter_pro_data enable row level security;

drop policy if exists "anon_insert_yt_filter_pro_data" on public.yt_filter_pro_data;
drop policy if exists "anon_select_yt_filter_pro_data" on public.yt_filter_pro_data;

create policy "anon_select_yt_filter_pro_data"
  on public.yt_filter_pro_data
  for select
  to anon
  using (true);

create policy "anon_insert_yt_filter_pro_data"
  on public.yt_filter_pro_data
  for insert
  to anon
  with check (true);

-- event_tracker
alter table if exists public.event_tracker enable row level security;

drop policy if exists "anon_insert_event_tracker" on public.event_tracker;

create policy "anon_insert_event_tracker"
  on public.event_tracker
  for insert
  to anon
  with check (true);

-- YT Filter Pro admin tables
alter table if exists public.yt_filter_pro_profiles enable row level security;
alter table if exists public.yt_filter_pro_gift_codes enable row level security;
alter table if exists public.yt_filter_pro_gift_redemptions enable row level security;

drop policy if exists "anon_select_yt_filter_pro_profiles" on public.yt_filter_pro_profiles;
create policy "anon_select_yt_filter_pro_profiles"
  on public.yt_filter_pro_profiles
  for select
  to anon
  using (true);

drop policy if exists "anon_select_yt_filter_pro_gift_codes" on public.yt_filter_pro_gift_codes;
create policy "anon_select_yt_filter_pro_gift_codes"
  on public.yt_filter_pro_gift_codes
  for select
  to anon
  using (true);

drop policy if exists "anon_select_yt_filter_pro_gift_redemptions" on public.yt_filter_pro_gift_redemptions;
create policy "anon_select_yt_filter_pro_gift_redemptions"
  on public.yt_filter_pro_gift_redemptions
  for select
  to anon
  using (true);

-- NOTE: Extension-facing write policies under other names are untouched.
-- NOTE: If a CREATE POLICY fails with "already exists", that policy name exists
-- under a different definition — drop it manually, then re-run this script.
