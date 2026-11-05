-- Read-only admin access for Stripe checkout license rows (Check license → Subscribers table).
-- Run in Supabase SQL Editor. Does not modify Stripe or customer data — SELECT policies only.
--
-- Project pinypmgcawshibcmyxqp (YouTube Filter Pro + IG DM Exporter):
--   yt_filter_pro_stripe_license_pending, idme_stripe_license_pending
-- Project kthoejkvaattozbkszcq (IG Reels Insight):
--   ivd_stripe_license_pending

-- ========== pinypmgcawshibcmyxqp ==========

alter table if exists public.yt_filter_pro_stripe_license_pending enable row level security;
drop policy if exists "anon_select_yt_stripe_license_pending" on public.yt_filter_pro_stripe_license_pending;
create policy "anon_select_yt_stripe_license_pending"
  on public.yt_filter_pro_stripe_license_pending for select to anon using (true);
grant select on public.yt_filter_pro_stripe_license_pending to anon, authenticated;

alter table if exists public.idme_stripe_license_pending enable row level security;
drop policy if exists "anon_select_idme_stripe_license_pending" on public.idme_stripe_license_pending;
create policy "anon_select_idme_stripe_license_pending"
  on public.idme_stripe_license_pending for select to anon using (true);
grant select on public.idme_stripe_license_pending to anon, authenticated;

-- ========== kthoejkvaattozbkszcq ==========

alter table if exists public.ivd_stripe_license_pending enable row level security;
drop policy if exists "anon_select_ivd_stripe_license_pending" on public.ivd_stripe_license_pending;
create policy "anon_select_ivd_stripe_license_pending"
  on public.ivd_stripe_license_pending for select to anon using (true);
grant select on public.ivd_stripe_license_pending to anon, authenticated;
