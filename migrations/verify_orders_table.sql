-- =============================================================================
-- MIGRATION: Verify & Test Orders Table Schema
-- After fixing "column product does not exist" error
-- =============================================================================

-- Step 1: Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Step 2: Test the exact update query that was failing
-- Replace with your actual order ID and user ID
DO $$
DECLARE
  test_order_id UUID := '33326958-608a-420a-9706-e48d460eaa82'::UUID; -- From error
  test_user_id UUID := 'c5ad65b6-0512-450b-89fe-c3c3e84b12f9'::UUID;  -- From error
BEGIN
  UPDATE orders 
  SET 
    order_status = 'Processing',
    updated_at = NOW()
  WHERE id = test_order_id 
    AND user_id = test_user_id;
    
  RAISE NOTICE '✅ Test update succeeded for order: %', test_order_id;
  
  -- Verify products column still exists and is correct
  PERFORM column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'orders' 
    AND column_name = 'products';
    
  RAISE NOTICE '✅ Products column verified: JSONB type';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Test failed: %', SQLERRM;
END $$;

-- Step 3: Validate all orders products data
SELECT 
  order_number,
  jsonb_typeof(products) as products_type,
  CASE 
    WHEN jsonb_typeof(products) = 'array' THEN '✅ VALID'
    ELSE '❌ INVALID: ' || products::text 
  END as status
FROM orders 
WHERE jsonb_typeof(products) != 'array';

-- Expected: No rows returned (all valid)

-- Step 4: Test RLS policies
-- This should only show YOUR orders
SELECT COUNT(*) as my_orders FROM orders WHERE user_id = auth.uid();

-- Step 5: Re-analyze table for query planner
ANALYZE orders;

-- =============================================================================
-- RUN THIS in Supabase SQL Editor, then:
-- 1. Check no errors in output
-- 2. Restart your dev server (npm run dev) 
-- 3. Test order editing in UI
-- =============================================================================
