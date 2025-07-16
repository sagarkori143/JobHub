-- Add total_visits column to portal_stats table
-- This migration adds the missing visits tracking column

-- Add total_visits column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portal_stats' AND column_name = 'total_visits') THEN
        ALTER TABLE portal_stats ADD COLUMN total_visits INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_visits column to portal_stats table';
    ELSE
        RAISE NOTICE 'total_visits column already exists in portal_stats table';
    END IF;
END $$;

-- Update the existing row to have a default value
UPDATE portal_stats SET total_visits = 0 WHERE id = 1 AND total_visits IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'portal_stats' AND column_name = 'total_visits'; 