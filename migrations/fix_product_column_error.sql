-- Migration: Fix "column product does not exist" error
-- PendingOrdersTable.jsx:466
-- =============================================================================

-- Step 1: Verify the problematic column exists
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name = 'product';

-- Step 2: DROP the rogue "product" column (ghost from old migration)
ALTER TABLE orders 
DROP COLUMN IF EXISTS "product";

-- Step 3: Verify fix
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'orders' ORDER BY ordinal_position;

-- Step 4: Test the fix
-- Orders should now update without "column product does not exist" error

-- RUN THIS IN SUPABASE SQL EDITOR, then restart your dev server (npm run dev)

-- Expected result after Step 3: No "product" column in orders table

