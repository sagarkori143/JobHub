-- Add avatar_url column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN avatar_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user profile image stored in Supabase Storage'; 