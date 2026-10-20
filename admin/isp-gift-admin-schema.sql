-- IG Saved Posts Exporter — gift admin (Coded Citadel admin panel)
-- Run after isp-schema.sql (extension repo scripts/isp-schema.sql) on the same Supabase project.

alter table public.isp_gift_codes enable row level security;
alter table public.isp_gift_device_redemptions enable row level security;

drop policy if exists "anon_all_isp_gift_codes" on public.isp_gift_codes;
create policy "anon_all_isp_gift_codes"
  on public.isp_gift_codes for all to anon
  using (true) with check (true);

drop policy if exists "admin_all_isp_gift_codes" on public.isp_gift_codes;
create policy "admin_all_isp_gift_codes"
  on public.isp_gift_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anon_all_isp_gift_device_redemptions" on public.isp_gift_device_redemptions;
create policy "anon_all_isp_gift_device_redemptions"
  on public.isp_gift_device_redemptions for all to anon
  using (true) with check (true);

drop policy if exists "admin_all_isp_gift_device_redemptions" on public.isp_gift_device_redemptions;
create policy "admin_all_isp_gift_device_redemptions"
  on public.isp_gift_device_redemptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant all on public.isp_gift_codes to service_role, anon, authenticated;
grant all on public.isp_gift_device_redemptions to service_role, anon, authenticated;
