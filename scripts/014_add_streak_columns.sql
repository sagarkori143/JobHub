-- Add streak-related columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN login_dates JSONB DEFAULT '[]',
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN longest_streak INTEGER DEFAULT 0,
ADD COLUMN total_applications INTEGER DEFAULT 0,
ADD COLUMN last_login_date DATE,
ADD COLUMN last_application_date DATE;

-- Create index for better performance on date queries
CREATE INDEX idx_user_profiles_login_dates ON user_profiles USING GIN (login_dates);
CREATE INDEX idx_user_profiles_last_login_date ON user_profiles (last_login_date); 