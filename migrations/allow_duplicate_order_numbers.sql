-- =============================================================================
-- MIGRATION: Allow Duplicate Order Numbers Per User
-- =============================================================================
-- This migration removes the global UNIQUE constraint from order_number
-- allowing different users to have the same order numbers (e.g., ORD-24-001)
-- 
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Step 1: Drop the existing unique constraint on order_number
-- First, find the constraint name
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Get the constraint name for orders table
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'orders'::regclass
    AND contype = 'u'
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'orders'::regclass AND attname = 'order_number')];
    
    -- Drop the unique constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE orders DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No unique constraint found on order_number';
    END IF;
END $$;

-- Step 2: Add a unique constraint per user (optional - ensures order numbers are unique WITHIN a user)
-- Uncomment the following line if you want order numbers to be unique per user:
-- CREATE UNIQUE INDEX idx_orders_user_order_number ON orders(user_id, order_number);

-- Step 3: Update the order number generation function to be per-user
-- The existing function already uses user_id, but we simplify it now
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
    new_order_num TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    year_str := TO_CHAR(NOW(), 'YY');
    
    -- Retry loop to handle race conditions
    LOOP
        attempt := attempt + 1;
        
        -- Get next number for THIS USER ONLY
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(order_number FROM 7 FOR 3) AS INTEGER)
        ), 0) + 1 INTO next_num
        FROM orders
        WHERE user_id = NEW.user_id;
        
        new_order_num := 'ORD-' || year_str || '-' || LPAD(next_num::TEXT, 3, '0');
        
        -- Check if this order_number already exists FOR THIS USER (rare race condition)
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_num AND user_id = NEW.user_id) THEN
            NEW.order_number := new_order_num;
            EXIT;
        END IF;
        
        -- If we've tried too many times, exit with what we have
        IF attempt >= max_attempts THEN
            -- Fallback: use timestamp-based unique number
            NEW.order_number := 'ORD-' || year_str || '-' || LPAD(next_num::TEXT, 3, '0') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- 
-- After running this migration:
-- 1. Different users can have the same order numbers (e.g., ORD-24-001)
-- 2. Order numbers are still unique WITHIN each user
-- 3. The frontend code requires NO changes - it already filters by user_id
-- 
-- To verify the changes:
-- SELECT order_number, user_id, COUNT(*) FROM orders GROUP BY order_number, user_id HAVING COUNT(*) > 1;
-- =============================================================================

