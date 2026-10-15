export const YFP_SUPABASE_URL = 'https://pinypmgcawshibcmyxqp.supabase.co'
export const YFP_STRIPE_APP_ID = 'youtube-filter-pro'
export const YFP_FULFILL_URL = `${YFP_SUPABASE_URL}/functions/v1/stripe-checkout-fulfill`

/** IG Reels Insight (IVD) — CodedCitadel V2 Supabase */
export const IVD_SUPABASE_URL = 'https://kthoejkvaattozbkszcq.supabase.co'
export const IVD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aG9lamt2YWF0dG96YmtzemNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2Mzc2OTcsImV4cCI6MjEwNjIxMzY5N30.M2KILcdIT8w5btv9MSLeCfqdaSHLWah7NM8Tf0s_HN8'
export const IVD_STRIPE_APP_ID = 'ivd'
export const IVD_APP_SLUG = 'custom-data-flgffomd'
export const IVD_FULFILL_URL = `${IVD_SUPABASE_URL}/functions/v1/ivd-stripe-checkout-fulfill`

/** Shared anon key for pinypmgcawshibcmyxqp (YFP + IG DM Edge functions). */
export const YFP_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbnlwbWdjYXdzaGliY215eHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTA2OTMsImV4cCI6MjA5Mzc2NjY5M30.Oabrt3eiLuYA-Lr5uH4w9VPh_CWqQJ2uo-hE07WQsFM'

/** IG DM Exporter — Worker primary; Supabase Edge fallback if Worker secrets are incomplete */
export const IDME_STRIPE_APP_ID = 'instagram-dm-export'
export const IDME_APP_SLUG = 'instagram-dm-exporter'
export const IDME_FULFILL_URL =
  'https://idme-billing.possesswithin.workers.dev/stripe/checkout-fulfill'
export const IDME_SUPABASE_FULFILL_URL = `${YFP_SUPABASE_URL}/functions/v1/idme-stripe-checkout-fulfill`

/** Saved Posts Exporter for IG (ISP) — Cloudflare Worker billing */
export const ISP_STRIPE_APP_ID = 'isp'
export const ISP_APP_SLUG = 'custom-data'
export const ISP_FULFILL_URL =
  'https://isp-billing.possesswithin.workers.dev/stripe/checkout-fulfill'
