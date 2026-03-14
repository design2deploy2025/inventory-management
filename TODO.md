# Purchase Orders Feature Implementation

## Plan Steps:
- [x] Step 1: Create src/dashboard/PurchaseOrders.jsx component (table for incoming orders, stock updates)
- [x] Step 1.5: Create src/dashboard/PurchaseOrderModal.jsx (modal for PO CRUD)

- [x] Step 2: Update src/dashboard/SideBar.jsx (add 'purchase-orders' button under orders)
- [x] Step 3: Update src/pages/Dashboard.jsx (add import and render case for purchase-orders)

- [x] Step 4: Test integration (npm run dev, verify new tab, basic functionality)
- [x] Step 5: Backend - Add Supabase table/migration if needed for purchase_orders (created migrations/create_purchase_orders_table.sql)

- [ ] Step 6: Implement stock update logic on receive

Current progress: Starting Step 1.

**Assumptions:** 
- UI styled like MainTable.jsx
- Fetches from supabase 'purchase_orders' table (PO ID, supplier, items, qty, status)
- Receive action: increment product stock

