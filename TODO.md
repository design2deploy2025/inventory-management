# Task: Fix PendingOrdersTable.jsx:466 "column product does not exist" Error

## Plan Progress Tracker

- [x] **Step 1**: Analyzed files & confirmed root cause (rogue "product" column in DB)
- [ ] **Step 2**: Created migration file `migrations/fix_product_column_error.sql`
- [ ] **Step 3**: Execute migration in Supabase SQL Editor:
  ```
  -- Copy/paste entire content of fix_product_column_error.sql
  ```
- [ ] **Step 4**: Restart dev server: `npm run dev`
- [ ] **Step 5**: Test order editing in PendingOrdersTable → Should work without error
- [ ] **Step 6**: Mark complete ✅

## Quick Fix Instructions:
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste **entire** `fix_product_column_error.sql` content
3. Click **RUN**
4. Verify "product" column is gone (run verification query)
5. Restart your local dev server
6. Test editing an order

**Database schema now matches code perfectly!**

