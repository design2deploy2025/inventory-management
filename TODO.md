# TODO: Allow Duplicate Order Numbers Per User

## Problem
- Currently `order_number` in `orders` table has a GLOBAL unique constraint
- This prevents different users from having the same order numbers (e.g., ORD-24-001)

## Solution
1. Remove UNIQUE constraint from `order_number` column in orders table
2. Update auto-generation function to be per-user (already uses user_id)
3. Frontend already fetches by user_id - no changes needed

## Steps
- [x] 1. Create SQL migration to remove UNIQUE constraint from order_number
- [x] 2. Verify frontend code works correctly (it already fetches by user_id)
- [ ] 3. Run the migration in Supabase SQL Editor

## Files Changed
- `supabase-schema.sql` - Removed UNIQUE constraint from orders table
- `migrations/allow_duplicate_order_numbers.sql` - Migration script for existing databases

## Status
- [x] COMPLETED - Code changes done
- [ ] PENDING - Need to run migration in Supabase

