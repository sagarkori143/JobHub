-- Create job_notifications table
CREATE TABLE IF NOT EXISTS public.job_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('new_job', 'job_expired', 'application_status', 'interview_scheduled')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_notifications_user_id ON public.job_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_job_id ON public.job_notifications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_is_read ON public.job_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_job_notifications_created_at ON public.job_notifications(created_at);

-- Enable Row Level Security
ALTER TABLE public.job_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON public.job_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.job_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications" ON public.job_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_job_notifications_updated_at 
    BEFORE UPDATE ON public.job_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 