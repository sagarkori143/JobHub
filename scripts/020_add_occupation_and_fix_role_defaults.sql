-- Add occupation column to user_profiles table
-- This column stores the user's job title/occupation, separate from their system role

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Update the role column to have a default value of 'user' for new accounts
ALTER TABLE user_profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- Optional: Update any existing NULL role values to 'user'
UPDATE user_profiles 
SET role = 'user' 
WHERE role IS NULL OR role = 'User';

-- Add a comment to clarify the difference between role and occupation
COMMENT ON COLUMN user_profiles.role IS 'System access role: admin or user';
COMMENT ON COLUMN user_profiles.occupation IS 'Job title/occupation: Software Engineer, Data Scientist, etc.';
