-- 15-minute retention for image-search uploads
-- Run in Supabase Dashboard → SQL Editor (after image-search-storage.sql)
--
-- 1. Database → Extensions → enable "pg_cron" (and "pg_net" if prompted; not required here)
-- 2. Run this entire script once

-- Purge storage objects older than 15 minutes (backup if the browser tab closed early)
DO $$
BEGIN
  PERFORM cron.unschedule(j.jobid)
  FROM cron.job j
  WHERE j.jobname = 'purge-image-search-uploads';
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'purge-image-search-uploads',
  '*/5 * * * *',
  $$
  DELETE FROM storage.objects
  WHERE bucket_id = 'image-search-uploads'
    AND created_at < NOW() - INTERVAL '15 minutes';
  $$
);
