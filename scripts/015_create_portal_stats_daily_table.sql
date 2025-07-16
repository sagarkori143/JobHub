-- Create a table for daily portal stats trends
CREATE TABLE IF NOT EXISTS portal_stats_daily (
  date DATE PRIMARY KEY,
  users INTEGER DEFAULT 0,
  jobs INTEGER DEFAULT 0,
  emails INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0
);

