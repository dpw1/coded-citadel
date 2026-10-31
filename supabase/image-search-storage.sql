-- Image search temporary uploads (run in Supabase Dashboard → SQL Editor)
-- Bucket must exist first: Storage → New bucket → name "image-search-uploads" → **Private**

-- Allow anonymous uploads under u/
CREATE POLICY "image_search_anon_insert"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'image-search-uploads'
  AND (storage.foldername(name))[1] = 'u'
);

-- Required for createSignedUrl from the browser client
CREATE POLICY "image_search_anon_select"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'image-search-uploads');

-- Client deletes on reset / 15-minute timer / tab close
-- Server backup: run image-search-retention.sql (pg_cron, deletes after 15 minutes)
CREATE POLICY "image_search_anon_delete"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'image-search-uploads');
