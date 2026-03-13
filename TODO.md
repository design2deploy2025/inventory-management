# Fix "column product does not exist" Error - FINAL RESOLUTION PLAN
## Status: 🔄 IN PROGRESS (Step 1/4 Complete)

### ✅ Completed:
- [x] **Step 1**: Created `migrations/reset_order_product_data.sql` ✅
- [ ] **Step 2**: Run SQL in Supabase Dashboard → SQL Editor
- [ ] **Step 3**: Restart dev server (`Ctrl+C` → `npm run dev`)
- [ ] **Step 4**: Test order update → Verify fix

### Instructions for Steps 2-4:
```
1. COPY this SQL → Supabase Dashboard → SQL Editor → RUN:
```
```sql
-- From migrations/reset_order_product_data.sql (entire content)
```

```
2. RESTART: Ctrl+C → npm run dev
3. TEST: Try editing ANY pending order
4. CONFIRM: Reply "Test passed" or share new error
```

### What This Fixes:
```
BEFORE: UPDATE orders SET ... → "column product does not exist"
AFTER:  UPDATE orders SET products = [...] → ✅ Works
```
- Sanitizes corrupted `products` JSONB data
- Adds `CHECK` constraint preventing future corruption
- Resets Supabase query cache

**Next: Run SQL migration → Reply when done!**

