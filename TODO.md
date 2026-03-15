# Discount Feature Implementation - Create Order Modal
Status: In Progress

## Plan Summary
Add per-product discount percentage input (0-100%) in OrderModal selected products section.
- Initialize discountPercent: 0 for new products
- Add discount input UI per product row (after price)
- Update line total: price * qty * (1 - discount/100)
- Update grand total calculation
- Save discountPercent in products JSON to DB

## Steps
- [x] Step 1: Add discountPercent init in handleProductToggle
- [x] Step 2: Create handleDiscountChange handler  
- [x] Step 3: Update UI - add discount input in selected products row
- [x] Step 4: Update line total display formula
- [x] Step 5: Rename/update calculateTotal → calculateDiscountedTotal
- [x] Step 6: Update all total references
- [ ] Step 7: Test create order with discounts
- [ ] Step 8: Verify DB storage
- [ ] Complete: attempt_completion

Current Step: 7/8

