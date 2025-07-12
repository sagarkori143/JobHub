-- Create job_notifications table for notification tracking
CREATE TABLE IF NOT EXISTS public.job_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  notification_type text NOT NULL, -- e.g. 'email'
  status text NOT NULL,            -- e.g. 'sent', 'failed', 'pending'
  error_message text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_notifications_user_id ON public.job_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_notifications_job_id ON public.job_notifications(job_id); 