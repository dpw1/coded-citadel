-- Required for admin/index.html (anon key + file:// REST fetch).
-- Without SELECT policies, PostgREST returns [] instead of an error.

-- Enable RLS if not already (safe to re-run)
alter table public.feedback enable row level security;
alter table public.yt_filter_pro_data enable row level security;

-- Allow anon reads (private local admin tool only — do not expose /admin publicly)
drop policy if exists "anon_select_feedback" on public.feedback;
create policy "anon_select_feedback"
  on public.feedback
  for select
  to anon
  using (true);

drop policy if exists "anon_select_yt_filter_pro_data" on public.yt_filter_pro_data;
create policy "anon_select_yt_filter_pro_data"
  on public.yt_filter_pro_data
  for select
  to anon
  using (true);
