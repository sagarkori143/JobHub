-- Migration: Add job_tracking_state column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN job_tracking_state jsonb DEFAULT '{}'::jsonb; 