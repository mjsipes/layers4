-- Create storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clothing-images',
  'clothing-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policy to allow users to upload their own clothing images
CREATE POLICY "Users can upload their own clothing images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'clothing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy to allow users to view their own clothing images
CREATE POLICY "Users can view their own clothing images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'clothing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy to allow users to delete their own clothing images
CREATE POLICY "Users can delete their own clothing images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'clothing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS is already enabled on storage.objects by default