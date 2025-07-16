-- Add missing columns to user_profiles table if they don't exist
-- This migration ensures all profile fields are available

-- Add target_field column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'target_field') THEN
        ALTER TABLE user_profiles ADD COLUMN target_field TEXT;
    END IF;
END $$;

-- Add target_companies column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'target_companies') THEN
        ALTER TABLE user_profiles ADD COLUMN target_companies TEXT[];
    END IF;
END $$;

-- Add target_positions column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'target_positions') THEN
        ALTER TABLE user_profiles ADD COLUMN target_positions TEXT[];
    END IF;
END $$;

-- Add experience_level column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'experience_level') THEN
        ALTER TABLE user_profiles ADD COLUMN experience_level TEXT;
    END IF;
END $$;

-- Add gender column if it doesn't exist (from migration 006)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'gender') THEN
        ALTER TABLE user_profiles ADD COLUMN gender TEXT;
    END IF;
END $$; 