-- IG DM Exporter — admin + gift tables (run in Supabase SQL Editor)
-- Same project as other extensions; idme_ prefix avoids collisions.

-- ---------------------------------------------------------------------------
-- Gift codes (device / no-login redeem)
-- ---------------------------------------------------------------------------
create table if not exists public.idme_gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null default 'days'
    check (kind in ('days', 'months', 'lifetime')),
  duration_days integer not null default 0,
  max_redemptions integer not null default 1 check (max_redemptions >= 1),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  requires_login boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idme_gift_device_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_code_id uuid not null references public.idme_gift_codes (id) on delete cascade,
  device_id text not null,
  redeemed_at timestamptz not null default now(),
  grant_until timestamptz,
  unique (gift_code_id, device_id)
);

create index if not exists idme_gift_device_redemptions_device_id_idx
  on public.idme_gift_device_redemptions (device_id);

-- ---------------------------------------------------------------------------
-- Ensure license tables exist (no-op if already created)
-- ---------------------------------------------------------------------------
create table if not exists public.idme_license_pending (
  lemon_license_id text primary key,
  license_key text not null,
  device_id text,
  user_id text,
  email text,
  expires_at timestamptz,
  is_lifetime boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'activated', 'failed')),
  instance_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idme_license_device_grants (
  id bigserial primary key,
  device_id text not null,
  lemon_license_id text not null,
  license_key text,
  instance_id text,
  grant_until timestamptz,
  is_lifetime boolean not null default false,
  customer_email text,
  lemon_status text,
  activated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_id, lemon_license_id)
);

create table if not exists public.idme_export_usage (
  device_id text not null,
  period_key text not null,
  export_count integer not null default 0 check (export_count >= 0),
  transcription_count integer not null default 0 check (transcription_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (device_id, period_key)
);

-- ---------------------------------------------------------------------------
-- RLS — admin panel uses anon key (same pattern as YFP gift entitlements)
-- ---------------------------------------------------------------------------
alter table public.idme_gift_codes enable row level security;
alter table public.idme_gift_device_redemptions enable row level security;
alter table public.idme_license_pending enable row level security;
alter table public.idme_license_device_grants enable row level security;
alter table public.idme_export_usage enable row level security;

-- Gift codes: full access for anon (local admin) + authenticated admins
drop policy if exists "anon_all_idme_gift_codes" on public.idme_gift_codes;
create policy "anon_all_idme_gift_codes"
  on public.idme_gift_codes for all to anon
  using (true) with check (true);

drop policy if exists "admin_all_idme_gift_codes" on public.idme_gift_codes;
create policy "admin_all_idme_gift_codes"
  on public.idme_gift_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anon_all_idme_gift_device_redemptions" on public.idme_gift_device_redemptions;
create policy "anon_all_idme_gift_device_redemptions"
  on public.idme_gift_device_redemptions for all to anon
  using (true) with check (true);

drop policy if exists "admin_all_idme_gift_device_redemptions" on public.idme_gift_device_redemptions;
create policy "admin_all_idme_gift_device_redemptions"
  on public.idme_gift_device_redemptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- License / usage: admin read (and update grants) via anon for local admin panel
drop policy if exists "anon_select_idme_license_device_grants" on public.idme_license_device_grants;
create policy "anon_select_idme_license_device_grants"
  on public.idme_license_device_grants for select to anon using (true);

drop policy if exists "anon_all_idme_license_device_grants" on public.idme_license_device_grants;
create policy "anon_all_idme_license_device_grants"
  on public.idme_license_device_grants for all to anon
  using (true) with check (true);

drop policy if exists "admin_all_idme_license_device_grants" on public.idme_license_device_grants;
create policy "admin_all_idme_license_device_grants"
  on public.idme_license_device_grants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anon_select_idme_license_pending" on public.idme_license_pending;
create policy "anon_select_idme_license_pending"
  on public.idme_license_pending for select to anon using (true);

drop policy if exists "admin_select_idme_license_pending" on public.idme_license_pending;
create policy "admin_select_idme_license_pending"
  on public.idme_license_pending for select to authenticated
  using (public.is_admin());

drop policy if exists "anon_select_idme_export_usage" on public.idme_export_usage;
create policy "anon_select_idme_export_usage"
  on public.idme_export_usage for select to anon using (true);

drop policy if exists "admin_select_idme_export_usage" on public.idme_export_usage;
create policy "admin_select_idme_export_usage"
  on public.idme_export_usage for select to authenticated
  using (public.is_admin());

-- Keep service_role full access for edge functions
grant all on public.idme_gift_codes to service_role, anon, authenticated;
grant all on public.idme_gift_device_redemptions to service_role, anon, authenticated;
grant all on public.idme_license_pending to service_role;
grant select on public.idme_license_pending to anon, authenticated;
grant all on public.idme_license_device_grants to service_role, anon, authenticated;
grant all on public.idme_export_usage to service_role;
grant select on public.idme_export_usage to anon, authenticated;
grant usage, select on sequence public.idme_license_device_grants_id_seq to service_role, anon, authenticated;
