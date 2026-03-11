# TODO: Custom Order ID Feature

## Plan: Allow Users to Create Custom Order IDs

### Step 1: Update OrderModal.jsx
- [x] Add state for `useCustomOrderId` (boolean toggle)
- [x] Add state for `customOrderId` (string input)
- [x] Add toggle switch UI in the Order Details section
- [x] Show/hide custom order ID input based on toggle
- [x] Update formData handling to include custom order ID
- [x] Modify handleSave to pass custom order number when provided

### Step 2: Update supabase-schema.sql
- [x] Create migration file for custom order number trigger
- [x] Modify `set_order_number()` trigger function
- [x] Check if custom order number is provided (NEW.order_number)
- [x] If provided, validate uniqueness per user
- [x] If not provided or duplicate, fallback to auto-generation

### Step 3: Update MainTable.jsx
- [x] Modify handleSaveOrder to pass custom order number
- [x] Pass the custom order number in the insert query

### Step 4: Update PendingOrdersTable.jsx
- [x] Modify handleSaveOrder to pass custom order number
- [x] Pass the custom order number in the insert query

### Step 5: Test the implementation
- [ ] Test auto-generation (default behavior)
- [ ] Test custom order ID creation
- [ ] Test uniqueness constraint (duplicate custom order IDs)
- [ ] Test edit mode preserves original order ID

## Summary
All frontend code changes are complete. The database migration needs to be run in Supabase SQL Editor to enable the custom order number functionality.

