ALTER TABLE public.job_notifications
ADD COLUMN IF NOT EXISTS notification_payload jsonb; 