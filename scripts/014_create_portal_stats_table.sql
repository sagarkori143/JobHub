-- Create portal_stats table for storing app-wide statistics
CREATE TABLE IF NOT EXISTS portal_stats (
  id SERIAL PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  total_emails_generated INTEGER DEFAULT 0,
  total_jobs_added INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one row is expected; use id=1 for upsert/updates
INSERT INTO portal_stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING; 
ALTER TABLE portal_stats ADD COLUMN IF NOT EXISTS visits INTEGER DEFAULT 0; 