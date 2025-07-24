-- Migration: Add jobs_tracking column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN jobs_tracking jsonb DEFAULT '[]'::jsonb; 