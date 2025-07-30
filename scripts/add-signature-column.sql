-- Add signature_url column to company_settings table
ALTER TABLE company_settings
ADD COLUMN signature_url TEXT DEFAULT '';

-- Create signatures storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload signatures
CREATE POLICY "Users can upload their own signatures" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'signatures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own signatures
CREATE POLICY "Users can view their own signatures" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'signatures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own signatures
CREATE POLICY "Users can delete their own signatures" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'signatures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update existing records to have empty signature_url if null
UPDATE company_settings 
SET signature_url = '' 
WHERE signature_url IS NULL;
