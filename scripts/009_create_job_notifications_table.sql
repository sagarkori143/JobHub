-- Create job_notifications table for tracking new job openings
CREATE TABLE IF NOT EXISTS job_notifications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_notifications_status ON job_notifications(status);
CREATE INDEX IF NOT EXISTS idx_job_notifications_scheduled ON job_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_job_notifications_company ON job_notifications(company);

-- Create RLS policies for job_notifications
ALTER TABLE job_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can manage all notifications" ON job_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read only)
CREATE POLICY "Users can view notifications" ON job_notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample notification (for testing)
INSERT INTO job_notifications (id, job_id, company, title, location, url, status)
VALUES (
    'notification-test-001',
    'job-test-001',
    'Amazon',
    'Software Engineer',
    'Seattle, WA',
    'https://amazon.com/careers/job-001',
    'pending'
) ON CONFLICT (id) DO NOTHING;

-- Create a function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete notifications older than 30 days that are not pending
    DELETE FROM job_notifications 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status != 'pending';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old notifications (optional)
-- This would need to be set up with pg_cron extension if available
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications();'); 