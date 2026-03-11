-- =============================================================================
-- MIGRATION: Support Custom Order Numbers
-- =============================================================================
-- This migration modifies the set_order_number() trigger function to support
-- custom order numbers provided by users. If a custom order number is not
-- provided, it will auto-generate one in the format ORD-YY-XXX.
--
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Update the set_order_number function to accept custom order numbers
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
    
    -- Check if custom order number is provided
    IF NEW.order_number IS NOT NULL AND NEW.order_number != '' THEN
        -- Validate: Check if custom order number is already used by this user
        IF EXISTS (
            SELECT 1 FROM orders 
            WHERE order_number = NEW.order_number 
            AND user_id = NEW.user_id
        ) THEN
            -- Custom order number already exists for this user, append timestamp to make it unique
            NEW.order_number := NEW.order_number || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
        ELSE
            -- Custom order number is valid, use it as-is
            NEW.order_number := NEW.order_number;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- If no custom order number provided, auto-generate one
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
-- 1. Users can provide custom order numbers when creating orders
-- 2. If custom order number is provided, it will be used (if not duplicate for that user)
-- 3. If custom order number is already taken, a suffix will be added to make it unique
-- 4. If no custom order number is provided, auto-generation continues as before (ORD-YY-XXX)
-- 
-- To test:
-- INSERT INTO orders (user_id, order_number, customer_name, total_price) 
-- VALUES ('user-uuid-here', 'MYSTORE-001', 'Test Customer', 100);
-- 
-- INSERT INTO orders (user_id, customer_name, total_price) 
-- VALUES ('user-uuid-here', 'Test Customer 2', 200);
-- =============================================================================

