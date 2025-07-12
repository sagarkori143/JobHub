-- Add company_logo column to user_job_applications table
ALTER TABLE user_job_applications 
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Add company_logo column to jobs table (if it exists)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_logo TEXT; 