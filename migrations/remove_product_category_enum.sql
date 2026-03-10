-- Migration: Remove product_category enum and change to TEXT
-- This allows users to use any custom category for their products

-- Step 1: Alter the category column to TEXT (with default value for existing rows)
ALTER TABLE products 
ALTER COLUMN category TYPE TEXT,
ALTER COLUMN category SET DEFAULT 'Other';

-- Step 2: Drop the enum type (optional - only if no other tables use it)
-- Uncomment the following line if you're sure no other tables reference this enum
-- DROP TYPE IF EXISTS product_category;

-- Step 3: Verify the change
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'category';

-- Note: This migration is safe to run. Existing products will keep their category values.

