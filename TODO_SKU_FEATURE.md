# TODO: Custom SKU Feature Implementation

## Task
Allow users to create their own custom SKU. If they don't provide one, auto-generate it.

## Implementation Plan

### 1. Update ProductModal.jsx
- [x] Add a checkbox/toggle "Set Custom SKU" 
- [x] Make SKU input field editable when toggle is checked
- [x] Add status indicators showing "(Auto-generated)" or "(Custom)"

### 2. Update ProductDetails.jsx
- [x] Pass the SKU value to Supabase instead of always setting to null
- [x] For new products: if user provides SKU, use it; otherwise let DB auto-generate

## Database
The database already supports this! The trigger `set_product_sku_trigger` only auto-generates when SKU is NULL or empty.

## Status: COMPLETED ✅

