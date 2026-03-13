-- =============================================================================
-- MIGRATION: Reset corrupted product data in orders table
-- Fix "column product does not exist" error permanently
-- =============================================================================

/*
PROBLEM: Orders table has malformed 'products' JSONB data containing "product" keys
SOLUTION: Sanitize ALL orders.products data to proper array format
*/

-- Step 1: Backup current data (optional but recommended)
-- CREATE TABLE orders_backup AS SELECT * FROM orders;

-- =============================================================================
-- Step 2: Fix malformed products data
-- =============================================================================

UPDATE orders
SET products = CASE

  -- If NULL or literal null → empty array
  WHEN products IS NULL OR products = 'null'::jsonb THEN
    '[]'::jsonb

  -- If already array → keep it
  WHEN jsonb_typeof(products) = 'array' THEN
    products

  -- If object containing "product" key → convert to array
  WHEN jsonb_typeof(products) = 'object' AND products ? 'product' THEN
    jsonb_build_array(products -> 'product')

  -- If generic object → convert values to array
  WHEN jsonb_typeof(products) = 'object' THEN
    (
      SELECT jsonb_agg(value)
      FROM jsonb_each(products)
    )

  ELSE '[]'::jsonb

END
WHERE jsonb_typeof(products) IS DISTINCT FROM 'array';

-- =============================================================================
-- Step 3: Delete still corrupted records
-- =============================================================================

DELETE FROM orders
WHERE products IS NULL
   OR jsonb_typeof(products) != 'array';

-- =============================================================================
-- Step 4: Add validation constraint (prevents future corruption)
-- =============================================================================

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS products_must_be_array;

ALTER TABLE orders
ADD CONSTRAINT products_must_be_array
CHECK (
  products IS NULL OR jsonb_typeof(products) = 'array'
);

-- =============================================================================
-- Step 5: Optimize table
-- =============================================================================

ANALYZE orders;

-- =============================================================================
-- Step 6: Verify results
-- =============================================================================

SELECT
  id,
  order_number,
  jsonb_typeof(products) AS products_type,
  CASE
    WHEN jsonb_typeof(products) = 'array' THEN '✅ VALID'
    ELSE '❌ INVALID: ' || products::text
  END AS validation_status
FROM orders
LIMIT 10;