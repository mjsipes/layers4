-- Add image_url column to layer table for storing clothing images
ALTER TABLE layer ADD COLUMN image_url TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN layer.image_url IS 'URL path to the clothing image stored in Supabase Storage';