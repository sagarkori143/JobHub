CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT,
  joined_date DATE,
  job_preferences JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resume_url TEXT, -- stores the user's resume file URL
  ats_scores JSONB, -- stores an array of ATS scores with timestamps
  streaks JSONB, -- stores streaks data (days active, applications sent, etc.)
  resume_text TEXT, -- stores extracted text from the latest resume
  resume_scores JSONB, -- array of { score, date, resume_url }
  login_history JSONB, -- array of login timestamps
  target_field TEXT, -- user's target field/industry
  target_companies TEXT[], -- array of target companies
  target_positions TEXT[], -- array of target job titles/roles
  experience_level TEXT -- user's experience level (e.g., Entry, Mid, Senior)
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
