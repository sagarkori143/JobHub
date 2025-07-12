-- Create job notifications table to track sent notifications
CREATE TABLE IF NOT EXISTS job_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'email', 'sms', 'whatsapp'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_notifications_user_job ON job_notifications (user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_sent_at ON job_notifications (sent_at);

-- Enable Row Level Security (RLS)
ALTER TABLE job_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications." ON job_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for system to insert notifications (admin access)
CREATE POLICY "System can insert notifications." ON job_notifications
  FOR INSERT WITH CHECK (true);

-- Policy for system to update notifications (admin access)
CREATE POLICY "System can update notifications." ON job_notifications
  FOR UPDATE USING (true); 