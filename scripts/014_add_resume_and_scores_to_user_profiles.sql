-- Migration: Add resume_text, resume_scores, and login_history columns to user_profiles

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS resume_text text;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS resume_scores jsonb;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS login_history jsonb; 