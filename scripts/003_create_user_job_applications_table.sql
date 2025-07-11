CREATE TABLE IF NOT EXISTS user_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  date_applied DATE NOT NULL,
  status TEXT NOT NULL,
  industry TEXT NOT NULL,
  estimated_salary INTEGER,
  job_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_job_applications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own job applications
CREATE POLICY "Users can view their own job applications." ON user_job_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own job applications
CREATE POLICY "Users can insert their own job applications." ON user_job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own job applications
CREATE POLICY "Users can update their own job applications." ON user_job_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own job applications
CREATE POLICY "Users can delete their own job applications." ON user_job_applications
  FOR DELETE USING (auth.uid() = user_id);
