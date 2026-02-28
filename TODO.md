# TODO: Add Source Dropdown to Customers

## Task Summary
Add a dropdown in the customers table to choose the source of the customer, with Instagram as default.

## Implementation Steps

### 1. Update CustomerModal.jsx
- [x] Change source radio buttons to a dropdown select
- [x] Set default source to "Instagram"
- [x] Add proper styling for the dropdown
- [x] Add "Call" option to the dropdown

### 2. Update CustomersTable.jsx
- [x] Update handleSaveCustomer to save source field to Supabase
- [x] Update handleUpdateCustomer to save source field to Supabase
- [x] Update source derivation logic to use explicit source if available
- [x] Add "Call" option to the source filter dropdown
- [x] Add "Call" source badge styling

### 3. Update OrderModal.jsx
- [x] Save source when creating new customer from OrderModal
- [x] Set default source to "Instagram" in form states

### 4. Update supabase-schema.sql
- [x] Add source column to customers table with default 'Instagram'

## Status: COMPLETED

