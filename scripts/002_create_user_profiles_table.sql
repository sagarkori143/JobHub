CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT,
  joined_date DATE,
  job_preferences JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile." ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile." ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for users to insert their own profile (on sign-up)
CREATE POLICY "Users can insert their own profile." ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
