CREATE TABLE IF NOT EXISTS user_tag_subscriptions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES job_tags(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, tag_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_tag_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own tag subscriptions
CREATE POLICY "Users can view their own tag subscriptions." ON user_tag_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own tag subscriptions
CREATE POLICY "Users can insert their own tag subscriptions." ON user_tag_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own tag subscriptions
CREATE POLICY "Users can delete their own tag subscriptions." ON user_tag_subscriptions
  FOR DELETE USING (auth.uid() = user_id);
