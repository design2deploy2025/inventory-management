# Purchase Order Modal UI/UX Fix + Status Fields
Breakdown of approved plan into logical steps. Progress tracked here.

## Steps:
- [x] **Step 1**: Create new DB migration `migrations/add_payment_status_to_purchase_orders.sql` for payment_status column.
- [x] **Step 2**: Update `src/dashboard/PurchaseOrders.jsx` to handle payment_status in fetch/save/edit (add to select, map, insert/update, table column/badge).
- [x] **Step 3**: Update `src/dashboard/PurchaseOrderModal.jsx` for UI/UX fixes + fields (populate on edit, dropdowns, sections, validation, responsive).
- [ ] **Step 4**: Test modal: create/edit PO, verify DB updates (run migration first), check UI.
- [ ] **Step 5**: Complete - cleanup TODO.md.

**Note**: Run the migration in Supabase SQL editor before testing.

**Instructions**: After each step confirms success, I'll mark [x] and proceed. User: Run migration manually in Supabase SQL editor after Step 1.

