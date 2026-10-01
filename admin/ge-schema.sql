-- Gmail Exporter — gifts, Lemon license tables, RPCs (run in Supabase SQL Editor)
-- Same project as other extensions; ge_ prefix avoids collisions.
--
-- Fresh project: this file includes public.is_admin() for authenticated RLS policies.
-- Edit the email list below if you use Supabase Auth in admin (file:// admin uses anon).

-- ---------------------------------------------------------------------------
-- Admin helper (required by authenticated policies below)
-- ---------------------------------------------------------------------------
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
-- Gift codes (device / no-login redeem)
-- ---------------------------------------------------------------------------
create table if not exists public.ge_gift_codes (
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

create table if not exists public.ge_gift_device_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_code_id uuid not null references public.ge_gift_codes (id) on delete cascade,
  device_id text not null,
  redeemed_at timestamptz not null default now(),
  grant_until timestamptz,
  unique (gift_code_id, device_id)
);

create index if not exists ge_gift_device_redemptions_device_id_idx
  on public.ge_gift_device_redemptions (device_id);

-- ---------------------------------------------------------------------------
-- Lemon license (no-login)
-- ---------------------------------------------------------------------------
create table if not exists public.ge_license_pending (
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
  test_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ge_license_device_grants (
  id bigserial primary key,
  device_id text not null,
  lemon_license_id text not null,
  license_key text,
  instance_id text,
  grant_until timestamptz,
  is_lifetime boolean not null default false,
  customer_email text,
  lemon_status text,
  is_subscribed boolean not null default false,
  test_mode boolean not null default false,
  activated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_id, lemon_license_id)
);

create table if not exists public.ge_subscription_device_grants (
  id bigserial primary key,
  device_id text not null,
  subscription_id text not null,
  customer_email text,
  is_subscribed boolean not null default false,
  lemon_status text,
  renews_at timestamptz,
  ends_at timestamptz,
  grant_until timestamptz,
  test_mode boolean not null default false,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (device_id, subscription_id)
);

create table if not exists public.ge_export_usage (
  device_id text not null,
  period_key text not null,
  export_count integer not null default 0 check (export_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (device_id, period_key)
);

-- ---------------------------------------------------------------------------
-- Gift RPCs
-- ---------------------------------------------------------------------------
create or replace function public.ge_redeem_gift_code_anon(p_code text, p_device_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_gift public.ge_gift_codes%rowtype;
  v_now timestamptz := now();
  v_grant_until timestamptz;
  v_existing public.ge_gift_device_redemptions%rowtype;
  v_active_until timestamptz;
begin
  v_code := upper(trim(regexp_replace(coalesce(p_code, ''), '\s+', '-', 'g')));
  if v_code = '' or coalesce(trim(p_device_id), '') = '' then
    raise exception 'invalid_input';
  end if;

  select * into v_gift from public.ge_gift_codes where upper(code) = v_code for update;
  if not found then
    raise exception 'gift_not_found';
  end if;

  if v_gift.requires_login then
    raise exception 'requires_login';
  end if;

  select * into v_existing
  from public.ge_gift_device_redemptions
  where gift_code_id = v_gift.id and device_id = p_device_id;

  if found then
    if v_gift.kind = 'lifetime' then
      v_grant_until := null;
    else
      v_active_until := coalesce(v_existing.grant_until, v_now);
      if v_active_until < v_now then
        v_active_until := v_now;
      end if;
      if v_gift.kind = 'months' then
        v_grant_until := v_active_until + (v_gift.duration_days || ' months')::interval;
      else
        v_grant_until := v_active_until + (v_gift.duration_days || ' days')::interval;
      end if;
    end if;
    update public.ge_gift_device_redemptions
    set grant_until = v_grant_until, redeemed_at = v_now
    where id = v_existing.id;
  else
    if v_gift.redemption_count >= v_gift.max_redemptions then
      raise exception 'gift_exhausted';
    end if;
    if v_gift.kind = 'lifetime' then
      v_grant_until := null;
    elsif v_gift.kind = 'months' then
      v_grant_until := v_now + (v_gift.duration_days || ' months')::interval;
    else
      v_grant_until := v_now + (v_gift.duration_days || ' days')::interval;
    end if;
    insert into public.ge_gift_device_redemptions (gift_code_id, device_id, grant_until)
    values (v_gift.id, p_device_id, v_grant_until);
    update public.ge_gift_codes
    set redemption_count = redemption_count + 1, updated_at = v_now
    where id = v_gift.id;
  end if;

  return jsonb_build_object(
    'code', v_gift.code,
    'kind', v_gift.kind,
    'grant_until', v_grant_until,
    'is_lifetime', v_gift.kind = 'lifetime'
  );
end;
$$;

create or replace function public.ge_list_active_gifts(p_device_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'code', gc.code,
        'kind', gc.kind,
        'grant_until', r.grant_until,
        'is_lifetime', gc.kind = 'lifetime',
        'redeemed_at', r.redeemed_at
      )
      order by r.redeemed_at desc
    ),
    '[]'::jsonb
  )
  from public.ge_gift_device_redemptions r
  join public.ge_gift_codes gc on gc.id = r.gift_code_id
  where r.device_id = p_device_id
    and (
      gc.kind = 'lifetime'
      or r.grant_until is null
      or r.grant_until > now()
    );
$$;

grant execute on function public.ge_redeem_gift_code_anon(text, text) to anon, authenticated, service_role;
grant execute on function public.ge_list_active_gifts(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.ge_gift_codes enable row level security;
alter table public.ge_gift_device_redemptions enable row level security;
alter table public.ge_license_pending enable row level security;
alter table public.ge_license_device_grants enable row level security;
alter table public.ge_subscription_device_grants enable row level security;
alter table public.ge_export_usage enable row level security;

drop policy if exists "anon_all_ge_gift_codes" on public.ge_gift_codes;
create policy "anon_all_ge_gift_codes"
  on public.ge_gift_codes for all to anon using (true) with check (true);

drop policy if exists "admin_all_ge_gift_codes" on public.ge_gift_codes;
create policy "admin_all_ge_gift_codes"
  on public.ge_gift_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anon_all_ge_gift_device_redemptions" on public.ge_gift_device_redemptions;
create policy "anon_all_ge_gift_device_redemptions"
  on public.ge_gift_device_redemptions for all to anon using (true) with check (true);

drop policy if exists "admin_all_ge_gift_device_redemptions" on public.ge_gift_device_redemptions;
create policy "admin_all_ge_gift_device_redemptions"
  on public.ge_gift_device_redemptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anon_all_ge_license_device_grants" on public.ge_license_device_grants;
create policy "anon_all_ge_license_device_grants"
  on public.ge_license_device_grants for all to anon using (true) with check (true);

drop policy if exists "admin_all_ge_license_device_grants" on public.ge_license_device_grants;
create policy "admin_all_ge_license_device_grants"
  on public.ge_license_device_grants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anon_select_ge_license_pending" on public.ge_license_pending;
create policy "anon_select_ge_license_pending"
  on public.ge_license_pending for select to anon using (true);

drop policy if exists "anon_select_ge_subscription_device_grants" on public.ge_subscription_device_grants;
create policy "anon_select_ge_subscription_device_grants"
  on public.ge_subscription_device_grants for select to anon using (true);

drop policy if exists "anon_all_ge_subscription_device_grants" on public.ge_subscription_device_grants;
create policy "anon_all_ge_subscription_device_grants"
  on public.ge_subscription_device_grants for all to anon using (true) with check (true);

drop policy if exists "anon_select_ge_export_usage" on public.ge_export_usage;
create policy "anon_select_ge_export_usage"
  on public.ge_export_usage for select to anon using (true);

grant all on public.ge_gift_codes to service_role, anon, authenticated;
grant all on public.ge_gift_device_redemptions to service_role, anon, authenticated;
grant all on public.ge_license_pending to service_role;
grant select on public.ge_license_pending to anon, authenticated;
grant all on public.ge_license_device_grants to service_role, anon, authenticated;
grant all on public.ge_subscription_device_grants to service_role, anon, authenticated;
grant all on public.ge_export_usage to service_role;
grant select on public.ge_export_usage to anon, authenticated;
grant usage, select on sequence public.ge_license_device_grants_id_seq to service_role, anon, authenticated;
grant usage, select on sequence public.ge_subscription_device_grants_id_seq to service_role, anon, authenticated;
