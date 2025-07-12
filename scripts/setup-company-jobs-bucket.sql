-- Create company-jobs bucket for storing company job files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'company-jobs',
    'company-jobs',
    false, -- Private bucket
    10485760, -- 10MB file size limit
    ARRAY['application/json']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for company-jobs bucket
-- Service role can do everything
CREATE POLICY "Service role can manage company jobs" ON storage.objects
    FOR ALL USING (bucket_id = 'company-jobs' AND auth.role() = 'service_role');

-- Authenticated users can read company job files
CREATE POLICY "Users can read company jobs" ON storage.objects
    FOR SELECT USING (bucket_id = 'company-jobs' AND auth.role() = 'authenticated');

-- Insert sample company job file (for testing)
-- This would be uploaded by the scraper server
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
    'company-jobs',
    'amazon.json',
    '00000000-0000-0000-0000-000000000000', -- System user
    '{"size": 1024, "mimetype": "application/json", "cacheControl": "3600", "lastUpdated": "2024-01-01T00:00:00Z"}'
) ON CONFLICT (bucket_id, name) DO NOTHING;

-- Create a function to list company job files
CREATE OR REPLACE FUNCTION get_company_job_files()
RETURNS TABLE (
    name TEXT,
    size BIGINT,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.name,
        o.metadata->>'size'::BIGINT,
        o.updated_at
    FROM storage.objects o
    WHERE o.bucket_id = 'company-jobs'
    ORDER BY o.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_company_job_files() TO authenticated; 