# TODO - Remove existing customer check modifications

## Task:
- Remove existing customer check while editing order (only check while creating new order)
- Check should be based on instagram id OR phone (if any one matches)

## Steps:
- [x] 1. Modify checkExistingCustomer function - remove email check, keep only phone and instagram (OR logic)
- [x] 2. Modify handleSave function - add !isEditMode condition to only run customer check for new orders

## File edited:
- src/dashboard/OrderModal.jsx

## Summary of changes:
1. Removed email check from checkExistingCustomer function - now only checks phone OR instagram
2. Added !isEditMode condition to only run customer duplicate check when creating new orders (not editing)

