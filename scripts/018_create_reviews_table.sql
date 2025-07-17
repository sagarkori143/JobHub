-- Create reviews table in Supabase
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  experience text NOT NULL,
  issues text,
  suggestions text,
  created_at timestamptz DEFAULT now()
);

-- Optional index for recent reviews
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC); 