-- Migration: Add is_admin column to profiles table
-- Adds boolean column with default false for admin role tracking
-- Non-breaking: existing rows get NULL (casts to false in queries)

ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Optional: Update existing rows to explicitly false (uncomment if desired)
-- UPDATE profiles SET is_admin = false WHERE is_admin IS NULL;

