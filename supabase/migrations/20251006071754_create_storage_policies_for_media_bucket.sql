-- Create Storage Policies for Media Bucket
-- This migration creates Row Level Security policies for the media storage bucket
-- to allow authenticated users to upload and access images.

-- Policy 1: Public read access for everyone
CREATE POLICY "Public read access for media bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy 2: Merchants can upload their logos
CREATE POLICY "Merchants can upload their logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'merchant-logos' AND
  (storage.filename(name)) LIKE auth.uid()::text || '%'
);

-- Policy 3: Merchants can update their logos
CREATE POLICY "Merchants can update their logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'merchant-logos' AND
  (storage.filename(name)) LIKE auth.uid()::text || '%'
);

-- Policy 4: Clients can upload their profile photos
CREATE POLICY "Clients can upload their profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'client-photos' AND
  (storage.filename(name)) LIKE auth.uid()::text || '%'
);

-- Policy 5: Clients can update their profile photos
CREATE POLICY "Clients can update their profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'client-photos' AND
  (storage.filename(name)) LIKE auth.uid()::text || '%'
);

-- Policy 6: Merchants can upload offer images
CREATE POLICY "Merchants can upload offer images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 7: Merchants can update offer images
CREATE POLICY "Merchants can update offer images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = 'offers' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 8: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (
    (
      (storage.foldername(name))[1] = 'merchant-logos' AND
      (storage.filename(name)) LIKE auth.uid()::text || '%'
    ) OR
    (
      (storage.foldername(name))[1] = 'client-photos' AND
      (storage.filename(name)) LIKE auth.uid()::text || '%'
    ) OR
    (
      (storage.foldername(name))[1] = 'offers' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);
